import { AgentRequest, AgentResponse } from '../types/events'

export const buildResponseObject = <T>(
  event: AgentRequest,
  status: number,
  body: T
): AgentResponse => ({
  messageVersion: '1.0',
  response: {
    actionGroup: event.actionGroup,
    apiPath: event.apiPath,
    httpMethod: event.httpMethod,
    httpStatusCode: status,
    responseBody: {
      'application/json': {
        body: JSON.stringify(body),
      },
    },
  },
  sessionAttributes: event.sessionAttributes,
  promptSessionAttributes: event.promptSessionAttributes,
})
