#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib'
import { BedrockStack } from '../lib/bedrock-stack'
import { IntegrationsStack } from '../lib/integrations-stack'
import { ServiceStack } from '../lib/service-stack'

const app = new cdk.App()

const { pokemonLambda } = new IntegrationsStack(app, 'IntegrationsStack', {})

const { alias } = new BedrockStack(app, 'BedrockStack', {
  pokemonLambda,
})

new ServiceStack(app, 'ServiceStack', { agentAlias: alias })
