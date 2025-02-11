import {
  BedrockAgentRuntimeClient,
  InvokeAgentCommand,
} from '@aws-sdk/client-bedrock-agent-runtime'

interface AgentInvocationEvent {
  sessionId: string
  prompt: string
}

export const handler = async (event: AgentInvocationEvent) => {
  const client = new BedrockAgentRuntimeClient()

  const agentId = process.env.AGENT_ID
  const agentAliasId = process.env.AGENT_ALIAS_ID

  const command = new InvokeAgentCommand({
    agentId,
    agentAliasId,
    sessionId: event.sessionId,
    inputText: event.prompt,
  })

  try {
    let completion = ''
    const response = await client.send(command)

    if (response.completion === undefined) {
      throw new Error('Completion is undefined')
    }

    for await (const chunkEvent of response.completion) {
      const chunk = chunkEvent.chunk
      const trace = chunkEvent.trace
      console.log('Trace:', trace)
      const decodedResponse = new TextDecoder('utf-8').decode(chunk?.bytes)
      completion += decodedResponse
    }

    return { sessionId: event.sessionId, completion }
  } catch (err) {
    console.error(err)
    return { sessionId: event.sessionId, error: 'Error invoking agent' }
  }
}
