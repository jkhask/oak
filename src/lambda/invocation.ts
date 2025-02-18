import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from '@aws-sdk/client-apigatewaymanagementapi'
import {
  BedrockAgentRuntimeClient,
  InvokeAgentCommand,
} from '@aws-sdk/client-bedrock-agent-runtime'
import { APIGatewayProxyWebsocketEventV2 } from 'aws-lambda'

const agentId = process.env.AGENT_ID
const agentAliasId = process.env.AGENT_ALIAS_ID
const wsEndpoint = process.env.WS_ENDPOINT

const agentClient = new BedrockAgentRuntimeClient()
const wsClient = new ApiGatewayManagementApiClient({
  endpoint: wsEndpoint?.replace('wss://', 'https://'),
})

export const handler = async (event: APIGatewayProxyWebsocketEventV2) => {
  console.log('APIGatewayProxyWebsocketEventV2:', event)

  const { requestContext, body } = event
  const { connectionId } = requestContext
  const parsedBody = JSON.parse(body || '{}')
  const { sessionId, prompt } = parsedBody

  try {
    const command = new InvokeAgentCommand({
      agentId,
      agentAliasId,
      sessionId,
      enableTrace: true,
      inputText: prompt,
      streamingConfigurations: {
        streamFinalResponse: true,
      },
    })

    const response = await agentClient.send(command)

    if (response.completion === undefined) {
      throw new Error('Completion is undefined')
    }

    for await (const chunkEvent of response.completion) {
      const { chunk, trace } = chunkEvent
      // Only logging traces for rational and action group invocation for now
      if (
        trace?.trace?.orchestrationTrace?.rationale ||
        trace?.trace?.orchestrationTrace?.invocationInput
      ) {
        console.log('Trace:', JSON.stringify(trace))
      }
      if (chunk?.bytes) {
        const text = new TextDecoder('utf-8').decode(chunk.bytes)
        console.log('Received chunk:', text)
        const command = new PostToConnectionCommand({
          ConnectionId: connectionId,
          Data: text,
        })
        await wsClient.send(command)
      }
    }

    return { statusCode: 200, body: 'completed' }
  } catch (err) {
    console.error(err)
    if (err instanceof Error) {
      const command = new PostToConnectionCommand({
        ConnectionId: connectionId,
        Data: err.message,
      })
      await wsClient.send(command)
    }

    return { statusCode: 500, body: 'Error invoking agent' }
  }
}
