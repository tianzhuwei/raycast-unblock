import OpenAI from 'openai'
import { AzureKeyCredential, OpenAIClient } from '@azure/openai'
import type { ChatChoice, ChatCompletions, EventStream } from '@azure/openai'
import type { FastifyReply, FastifyRequest } from 'fastify'
import type { ChatCompletionChunk } from 'openai/resources/index.mjs'
import type { Stream } from 'openai/streaming.mjs'
import destr from 'destr'
import { getConfig } from '../../../utils/env.util'
import type { RaycastCompletions } from '../../../types/raycast/completions'
import { getFunctionCallToolsConfig } from '../functions'
import { AvailableFunctions } from '../functions/functions'
import { Debug } from '../../../utils/log.util'

export async function OpenAIChatCompletion(request: FastifyRequest, reply: FastifyReply) {
  const aiConfig = getConfig('ai')
  const openaiConfig = getConfig('ai')?.openai

  const body = request.body as RaycastCompletions

  const openai_message = []
  let temperature = openaiConfig?.temperature || aiConfig?.temperature || 0.5
  const messages = body.messages
  for (const message of messages) {
    if ('system_instructions' in message.content) {
      openai_message.push(
        {
          role: 'system',
          content: message.content.system_instructions,
        },
      )
    }

    if ('command_instructions' in message.content) {
      openai_message.push(
        {
          role: 'system',
          content: message.content.command_instructions,
        },
      )
    }

    if ('additional_system_instructions' in body) {
      openai_message.push(
        {
          role: 'system',
          content: body.additional_system_instructions,
        },
      )
    }

    if ('text' in message.content) {
      openai_message.push(
        {
          role: message.author,
          content: message.content.text,
        },
      )
    }

    if ('temperature' in message.content)
      temperature = message.content.temperature
  }

  let stream: Stream<ChatCompletionChunk> | EventStream<ChatCompletions>

  if (openaiConfig?.isAzure) {
    const azureOpenai = new OpenAIClient(
      openaiConfig!.baseUrl!,
      new AzureKeyCredential(openaiConfig!.apiKey!),
    )
    stream = await azureOpenai.streamChatCompletions(
      openaiConfig.azureDeploymentName || body.model,
      openai_message as any,
      {
        n: 1,
        temperature,
        // tools: getFunctionCallToolsConfig(),
        // toolChoice: 'auto',
        maxTokens: openaiConfig?.maxTokens || aiConfig?.maxTokens,
      },
    ).catch((err) => {
      throw new Error(`[AI] Azure OpenAI Chat Completions Failed: ${err?.message}`)
    })
  }
  else {
    const handlerMessageRecorder: string[] = []
    const openai = new OpenAI({
      baseURL: openaiConfig?.baseUrl,
      apiKey: openaiConfig?.apiKey,
    })

    const chatConfig = {
      model: body.model,
      temperature,
      stop: null,
      n: 1,
      max_tokens: openaiConfig?.maxTokens || aiConfig?.maxTokens,
    }
    const functionToolsConfig = getFunctionCallToolsConfig()
    if (
      body.web_search_tool
      && !aiConfig?.functions?.disable
      && functionToolsConfig.length > 0
    ) {
      Debug.info(`[AI] Function call tools: `, functionToolsConfig)
      Debug.info(`[AI] Web Search Tool option is on.`)
      // 在这里先做一次进行 Function Call
      // append 进 openai_message 里，再去做一次 steam 流，在 steam 中就可以不再加入 & 处理 tool_call 了
      const toolCallChainStep = await openai.chat.completions.create({
        stream: false,
        messages: openai_message as any,
        ...chatConfig,
        tools: functionToolsConfig,
        tool_choice: 'auto',
      }).catch((err) => {
        throw new Error(`[AI] OpenAI Chat Completions (toolCallChainStep) Failed: ${err}`)
      })
      // 处理 Function Call [Start]
      const responseMessage = toolCallChainStep.choices[0].message
      const toolCalls = responseMessage.tool_calls || []
      if (responseMessage.tool_calls) {
        Debug.info(`[AI] tool calls:`, toolCalls)
        // extend conversation with assistant's reply
        openai_message.push(responseMessage)
        // console.log('responseMessage', responseMessage)
        // // 处理 Handler [start]
        for (const toolCall of toolCalls) {
          // console.log('toolCall', toolCall)
          const functionName = toolCall.function.name
          const functionToCall = AvailableFunctions[functionName]
          const functionArgs = destr<any>(toolCall.function.arguments)
          // console.log('functionArgs', functionArgs)
          const functionArgsValues = Object.values(functionArgs)
          const functionHandler = functionToCall.handler
          const functionResponse = JSON.stringify(await functionHandler(...functionArgsValues))
          handlerMessageRecorder.push(functionResponse)
          Debug.info(`[AI] Function Call: ${functionName} successfully`)
          openai_message.push({
            tool_call_id: toolCall.id,
            role: 'tool',
            name: functionName,
            content: functionResponse,
          }) // extend conversation with function response
          // if (functionToCall.prompts?.length)
          //   openai_message.push(...functionToCall.prompts)
        }
      // // 处理 Handler [end]
      }
    // 处理 Function Call [End]
    }
    // console.log('Handled', openai_message)

    stream = await openai.chat.completions.create({
      stream: true,
      ...chatConfig,
      messages: openai_message as any,
    }).catch((err) => {
      throw new Error(`[AI] OpenAI Chat Completions Failed: ${err}`)
    })

    if (stream instanceof Error)
      throw new Error(`[AI] OpenAI Chat Completions Failed: ${stream}`)

    return reply.sse((async function* source() {
      try {
        for (const mes of handlerMessageRecorder)
          yield { data: mes }

        for await (const data of stream) {
          const { choices: [{ delta: { content } }] } = data
          const choice = data.choices[0]
          if (!choice)
            continue

          let finish_reason

          if ('finish_reason' in choice)
            finish_reason = choice.finish_reason
          else
            finish_reason = (choice as ChatChoice).finishReason

          if (!content && !finish_reason)
            continue // ignore this line
          const res: Record<string, unknown> = { text: content || '' }
          if (finish_reason) {
            res.finish_reason = finish_reason

            yield { data: JSON.stringify({
              text: '',
              finish_reason,
            }) }
          }

          yield { data: JSON.stringify(res) }
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
        // console.log('finally')
        const res = {
          text: '',
          finish_reason: 'stop',
        }
        yield { data: JSON.stringify(res) }
      }
    })())
  }
}
