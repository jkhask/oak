interface AgentParameter {
  name: string
  type: string
  value: string
}

interface ContentTypeProperty {
  name: string
  type: string
  value: string
}

type RequestBodyContent = Record<
  string,
  {
    properties: ContentTypeProperty[]
  }
>

interface AgentRequestBody {
  content: RequestBodyContent
}

interface Agent {
  name: string
  id: string
  alias: string
  version: string
}

export interface AgentRequestEvent {
  messageVersion: string
  agent: Agent
  inputText: string
  sessionId: string
  actionGroup: string
  apiPath: string
  httpMethod: string
  parameters: AgentParameter[]
  requestBody: AgentRequestBody
  sessionAttributes?: Record<string, string>
  promptSessionAttributes?: Record<string, string>
}
