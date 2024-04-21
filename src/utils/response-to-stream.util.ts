import { ReadableStream } from 'node:stream/web'

export function responseToStream(response: any) {
  const reader = response.body.getReader()
  return new ReadableStream({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done)
            break

          controller.enqueue(value)
        }
        controller.close()
      }
      catch (err) {
        controller.error(err)
      }
    },
  })
}
