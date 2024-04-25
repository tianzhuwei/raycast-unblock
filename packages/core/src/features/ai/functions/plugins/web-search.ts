import { ofetch } from 'ofetch'
import type { IAvailableFunction } from '@ru/shared'

/**
 * Search Google and return top 10 results
 */
export async function WebSearch(query: string) {
  const res = await ofetch('https://websearch.plugsugar.com/api/plugins/websearch', {
    method: 'POST',
    body: {
      query,
    },
  })
  const items = res.result.split('\n\n')
  const results = []

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const lines = item.split('\n')
    const result: Record<string, string> = {}

    for (let j = 0; j < lines.length; j++) {
      const line = lines[j]
      if (line.startsWith('Title: '))
        result.title = line.substring('Title: '.length)
      else if (line.startsWith('Result: '))
        result.description = line.substring('Result: '.length)
      else if (line.startsWith('URL: '))
        result.url = line.substring('URL: '.length)
    }

    results.push(result)
  }

  return {
    references: results,
    text: '',
  }
}

export const WebSearchConfig: IAvailableFunction = {
  id: 'web_search',
  description: 'Search for information from the internet',
  paramters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'The search query to be used',
      },
    },
  },
  handler: WebSearch,
  notifications: {
    calls: {
      text: 'Searching in Google...',
      type: 'tool_used',
    },
  },
  prompts: [
    {
      role: 'system',
      content: 'If you use relevant information in your answer, please mark the citation as strictly \'[Source](URL)\', and note that the first bracket must be the hard-coded English "Source "in the first parenthesis, which is relevant for subsequent rendering. You mustn\'t use markdown\'s markup syntax.',
    },
  ],
  required: ['query'],
}
