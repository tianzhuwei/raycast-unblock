import type { FastifyReply, FastifyRequest } from 'fastify'
import destr from 'destr'
import consola from 'consola'
import { getConfig } from '../../../utils/env.util'
import { generateCohereWebChatHeader } from '../../../services/cohere-web'
import { cohereClient } from '../../../utils'
import { COHERE_API_CHAT, COHERE_API_ENDPOINT } from '../../../services/cohere-web/constants'
import type { CohereWebCacheConversations, CohereWebChatBody, CohereWebChatResponse } from '../../../services/cohere-web/types'
import { responseToStream } from '../../../utils/response-to-stream.util'
import { getCache, setCache } from '../../../utils/cache.util'
import { Debug } from '../../../utils/log.util'
import { PreUniversalAICompletions } from './universal'

/**
 * Cohere Web Completions
 *
 * 这里面做了一个额外处理 -- 对话缓存
 *
 * 因为 Cohere Web 的请求并不是像 OpenAI 那样把所有的对话都请求过去
 * 而是使用了 conversationId 来保存对话的状态，这导致在使用 Raycast 请求的时候，我们要对应上这个 conversationId
 * 否则会导致对话上下文丢失。
 *
 * 目前考虑的是直接进行对话对比，如果对话内容一致，那么就使用之前的 conversationId，否则就重新开始一个对话。
 * 有人可能会一直重复一个内容，但是我们可能没法去处理这种情况，因为我们没法知道这个对话到底是哪个conversationId
 * 目前只能是选其中一个对话，然后使用这个对话的 conversationId 继续对话。
 *
 * 但是呢，Cohere Web 又很烦，有的时候最后给到我的结果是空的，这就导致我没法保存完整的对话内容。
 * 所以写了一大串的逻辑来处理这个问题，但是这个逻辑并不完美，只能说是尽量去处理这个问题。
 *
 * 注：
 * 如果在 Raycast 中尝试 retry，这相当于再次发送一遍之前的对话。
 *
 * 总结：
 * Raycast 不适合做这个事情，但是我硬着头皮做了。。。
 */
export async function CohereWebCompletions(request: FastifyRequest, reply: FastifyReply) {
  const debug = Debug.create('features:ai:completions:cohere-web')

  const config = getConfig('ai')?.cohere
  const preBody = (await PreUniversalAICompletions(request, config)).body
  let conversationId: string | undefined

  // 比对对话内容，如果有相同的对话，那么就使用之前的 conversationId
  const cache = getCache<CohereWebCacheConversations>('cohere', 'chat') || []
  for (const c of cache) {
    if (c.chat.length !== preBody.messages.length - 1)
      continue

    let isSame = true
    for (let i = 0; i < c.chat.length; i++) {
      if (c.chat[i].content !== preBody.messages[i].content) {
        isSame = false
        break
      }
    }

    if (isSame) {
      conversationId = c.conversationId
      debug.info('Maybe found same conversation. Id: ', conversationId)
      break
    }
  }

  // 如果没有找到相同的对话，检查请求里面是不是已经有过与assistant的对话
  let hasTalkedWithAssistant = false
  let needFixConversationId = false
  if (!conversationId) {
    // 缓存内的对话，从最新的往前翻
    const brokenCache = getCache<CohereWebCacheConversations>('cohere', 'chat') || []
    for (let i = brokenCache.length - 1; i >= 0; i--) {
      // 去看看最后一个对话是不是 assistant 的对话，并且检查内容是不是空的
      const c = brokenCache[i]
      if (c.chat[c.chat.length - 1].role === 'assistant' && c.chat[c.chat.length - 1].content === '') {
        debug.info('Found assistant message with empty content. Try to fix conversationId.')
        // 检查再上一条 user 内容是不是请求的一样的
        const preUser = c.chat[c.chat.length - 2].content
        if (preUser === preBody.messages[preBody.messages.length - 1].content) {
          conversationId = c.conversationId
          needFixConversationId = true
          debug.info('Found conversationId with empty assistant message. Id:', conversationId)
          break
        }
        else {
          debug.error('The last user message is not the same as the request. We will start a new conversation.')
        }
      }
    }

    if (!needFixConversationId) {
      for (const message of preBody.messages) {
        if (message.role === 'assistant') {
          hasTalkedWithAssistant = true
          debug.info(`Found assistant message. This conversation isn't in cache. We will stop it.`)
          break
        }
      }
    }
  }

  if (hasTalkedWithAssistant)
    throw new Error('This conversation isn\'t in cache. We will stop it.')

  if (needFixConversationId) {
    // 从 Raycast 数据中获取对话内容
    const raycastData = preBody.messages[preBody.messages.length - 1]
    const brokenCache = getCache<CohereWebCacheConversations>('cohere', 'chat') || []
    // 从后往前找，找到第一个 assistant 为空的对话
    let found = false
    for (let i = brokenCache.length - 1; i >= 0; i--) {
      const c = brokenCache[i]
      if (c.chat[c.chat.length - 1].content === '') {
        conversationId = c.conversationId
        found = true
        debug.info('Found conversationId with empty assistant message. Id:', conversationId)
        break
      }
    }
    if (!found) {
      debug.error('Can\'t find conversationId with empty assistant message. We will start a new conversation.')
    }
    else {
      debug.info('Start fix conversationId with Raycast data.')
      const chat = brokenCache.find(c => c.conversationId === conversationId)?.chat || []
      const newChat = chat.map((c, i) => {
        if (i === chat.length - 1 && c.role === 'assistant') {
          return {
            role: 'assistant',
            content: raycastData.content,
          }
        }
        return c
      })
      setCache('cohere', 'chat', [
        ...brokenCache.filter(c => c.conversationId !== conversationId),
        {
          conversationId,
          chat: newChat,
        },
      ])
      debug.success('Fix conversationId with Raycast data. Id:', conversationId)
    }
  }

  const body = {
    message: '',
    model: preBody.model,
    temperature: preBody.temperature,
    citationQuality: 'CITATION_QUALITY_ACCURATE',
    conversationId,
  } as CohereWebChatBody

  // 如果是同一个对话，那么就不需要再次发送之前的对话内容
  if (!conversationId) {
    for (const message of preBody.messages) {
      if (message.role !== 'user')
        continue
      body.message += `${message.content}\n`
    }
  }
  else {
    body.message = preBody.messages[preBody.messages.length - 1].content
  }

  const headers = await generateCohereWebChatHeader()
  const res = await cohereClient.native(`${COHERE_API_ENDPOINT}${COHERE_API_CHAT}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  }).catch((e: any) => {
    throw new Error(`Request error: ${e.message}`)
  })

  if (!res.ok)
    throw new Error(`Request error: ${res.statusText}`)

  // 这个地方不是一个 stream，而是一个 response
  // 但是我们需要一个 stream，所以我们需要不断地读取 response 的 body，直到结束
  const stream = responseToStream(res)

  return reply.sse((async function * source() {
    try {
      for await (const data of stream) {
        const dataRes = destr(data) as Uint8Array
        const text = new TextDecoder().decode(dataRes)
        const chatRes = destr<CohereWebChatResponse>(text)
        const response = {
          text: chatRes.result.textGenerationStreamEvent?.text || '',
          finish_reason: chatRes.result.isFinished ? 'stop' : 'continue',
        }

        if (chatRes.result?.isFinished) {
          // 结束了本轮对话，开始缓存对话
          const conversationId = chatRes.result.chatStreamEndEvent?.response.conversationId // 保存对话的 ID
          const cache = getCache<CohereWebCacheConversations>('cohere', 'chat') || []
          // 检索对应的 conversationId
          const preFind = cache.find(c => c.conversationId === conversationId)
          const preCache = preFind || { conversationId: '', chat: [] }
          if (preFind)
            debug.info('Found conversationId: ', conversationId)

          const newChat = [] as {
            role: string
            content: string
          }[]

          debug.info(`Add to cache with conversationId - ${conversationId}`)
          for (const message of preBody.messages) {
            newChat.push({
              role: message.role,
              content: message.content,
            })
          }
          // 添加 assistant 的回复
          const fullChat = chatRes.result.chatStreamEndEvent?.response.text
          if (!fullChat)
            consola.warn(`Can't record full chat, this conversation@${conversationId} may have problem. We will try to fix this conversation with Raycast data next time.`)
          newChat.push({
            role: 'assistant',
            content: fullChat || '',
          })
          // 保存对话
          setCache('cohere', 'chat', [
            ...cache.filter(c => c.conversationId !== conversationId),
            {
              conversationId,
              chat: [
                ...preCache.chat,
                ...newChat,
              ],
            },
          ])
          debug.success('Cache conversationId:', conversationId)
        }

        yield { data: JSON.stringify(response) }
      }
    }
    catch (e: any) {
      console.error('Error: ', e.message)
      const res = {
        text: '',
        finish_reason: e.message,
      }
      yield { data: JSON.stringify(res) }
    }
    finally {
      const res = {
        text: '',
        finish_reason: 'stop',
      }
      yield { data: JSON.stringify(res) }
    }
  })())
}
