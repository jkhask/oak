import axios from 'axios'
import { AgentRequest, AgentResponse } from './types/events'
import { buildResponseObject } from './util/helpers'

export const handler = async (event: AgentRequest): Promise<AgentResponse> => {
  console.log(event)

  const endpoint = 'https://pokeapi.co/api/v2'

  try {
    switch (event.apiPath) {
      case '/pokemon': {
        const { data } = await axios.get(`${endpoint}/pokemon/?limit=151`)
        const resp = buildResponseObject(event, 200, data)
        console.log('Response:', resp)
        return resp
      }
      case `/pokemon/{name}`: {
        const pokemonName = event.parameters[0].value
        const { data } = await axios.get(`${endpoint}/pokemon/${pokemonName}`)
        const { id, name, height, weight, types, abilities, stats } = data
        // Max lambda response size the agent can accept is 25kB
        // We are only returning some of the large response
        const resp = buildResponseObject(event, 200, {
          id,
          name,
          height,
          weight,
          types,
          abilities,
          stats,
        })
        console.log('Response:', resp)
        return resp
      }
      default: {
        return buildResponseObject(event, 404, {
          error: 'API path not found',
        })
      }
    }
  } catch (error) {
    console.error(error)
    return buildResponseObject(event, 500, {
      error: 'Internal server error',
    })
  }
}
