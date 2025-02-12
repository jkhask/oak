import {
  BedrockAgentRuntimeClient,
  InvokeAgentCommand,
} from '@aws-sdk/client-bedrock-agent-runtime'
import { APIGatewayProxyWebsocketEventV2 } from 'aws-lambda'

export const handler = async (
  event: APIGatewayProxyWebsocketEventV2
) => {
  console.log('APIGatewayProxyWebsocketEventV2:', event)
  try {
    const client = new BedrockAgentRuntimeClient()

    const agentId = process.env.AGENT_ID
    const agentAliasId = process.env.AGENT_ALIAS_ID

    const { body } = event
    const parsedBody = JSON.parse(body || '{}')
    const { sessionId, prompt } = parsedBody

    const command = new InvokeAgentCommand({
      agentId,
      agentAliasId,
      sessionId,
      enableTrace: true,
      inputText: prompt,
    })

    let completion = ''
    const response = await client.send(command)

    console.log('Response:', response)

    if (response.completion === undefined) {
      throw new Error('Completion is undefined')
    }

    for await (const chunkEvent of response.completion) {
      const chunk = chunkEvent.chunk
      const trace = chunkEvent.trace
      console.log('Trace:', JSON.stringify(trace))
      const decodedResponse = new TextDecoder('utf-8').decode(
        chunk?.bytes
      )
      completion += decodedResponse
    }

    return { statusCode: 200, body: JSON.stringify(completion) }
  } catch (err) {
    console.error(err)
    return { status: 500, error: 'Error invoking agent' }
  }
}
