interface ResponseBodyContent {
  body: string
}

type ResponseBody = Record<string, ResponseBodyContent>

interface Response {
  actionGroup: string
  apiPath: string
  httpMethod: string
  httpStatusCode: number
  responseBody: ResponseBody
}

export interface DownstreamResponse {
  messageVersion: string
  response: Response
  sessionAttributes?: Record<string, string>
  promptSessionAttributes?: Record<string, string>
}
