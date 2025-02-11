import { AgentRequestEvent } from './interfaces/AgentRequestEvent'
import { DownstreamResponse } from './interfaces/DownstreamResponse'
import { buildResponseObject } from './util/helpers'

export const handler = async (
  event: AgentRequestEvent
): Promise<DownstreamResponse> => {
  console.log(event)

  try {
    switch (event.apiPath) {
      case '/hello': {
        const ret = buildResponseObject(event, 200, {
          message: 'Hello world',
        })
        console.log(JSON.stringify(ret))
        return ret
      }
      default: {
        return buildResponseObject(event, 404, { error: 'API path not found' })
      }
    }
  } catch (error) {
    console.error(error)
    return buildResponseObject(event, 500, { error: 'Internal server error' })
  }
}
