export interface AgentRequest {
  messageVersion: string
  parameters: { name: string; type: string; value: string }[]
  apiPath: string
  sessionId: string
  agent: {
    name: string
    version: string
    id: string
    alias: string
  }
  actionGroup: string
  httpMethod: string
  sessionAttributes: Record<string, string>
  promptSessionAttributes: Record<string, string>
  inputText: string
}

export interface AgentResponse {
  messageVersion: string
  response: {
    actionGroup: string
    apiPath: string
    httpMethod: string
    httpStatusCode: number
    responseBody: {
      'application/json': {
        body: string // JSON-formatted string
      }
    }
  }
  sessionAttributes: Record<string, string>
  promptSessionAttributes: Record<string, string>
}
