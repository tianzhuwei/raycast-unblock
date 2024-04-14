import { ofetch } from 'ofetch'
import { getConfig } from '../../../../utils/env.util'
import type { IAvailableFunction } from '../../../../types/internal/i-available-functions'

export async function Serp(query: string) {
  const payload = JSON.stringify({ keyword: query })
  const headers = {
    'apy-token': getConfig('ai', 'functions.serp.apyhubApiKey') as string,
  }
  const res = await ofetch('https://api.apyhub.com/extract/serp/rank', {
    method: 'POST',
    headers,
    body: payload,
  })

  const transformed_res = res.data.slice(0, 5).map((item: { title: any, url: any, description: any }) => {
    return {
      title: item.title,
      url: item.url,
      summary: item.description,
      images: [],
    }
  })

  return {
    references: transformed_res,
    text: '',
  }
}

export const SerpConfig: IAvailableFunction = {
  id: 'serp',
  description: 'Search Engine Results Page',
  paramters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'The search query to be used',
      },
    },
  },
  // == self config ==
  handler: Serp,
  notifications: {
    calls: {
      text: 'Searching with ApyHub API...',
      type: 'tool_used',
    },
  },
  prompts: [
    {
      role: 'system',
      content: 'Please summarize from the above information, but please note that if you use relevant information in your answer, please mark the citation as strictly \'[Source](URL)\', and note that the first bracket must be the hard-coded English "Source "in the first parenthesis, which is relevant for subsequent rendering. You don\'t have to use markdown\'s markup syntax.',
    },
  ],
  required: ['query'],
  requiredEnv: [
    'ai.functions.serp.apyhubApiKey',
    // 'ai.functions.serp.tavilyAiApiKey',
  ],
}
