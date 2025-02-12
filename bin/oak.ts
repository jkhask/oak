#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib'
import { BedrockStack } from '../lib/bedrock-stack'
import { IntegrationsStack } from '../lib/integrations-stack'
import { OrchestrationStack } from '../lib/orchestration-stack'

const APP_NAME = 'Oak'

const app = new cdk.App()

const { pokemonLambda } = new IntegrationsStack(
  app,
  `${APP_NAME}-IntegrationsStack`,
  {}
)

const { alias } = new BedrockStack(app, `${APP_NAME}-BedrockStack`, {
  pokemonLambda,
})

new OrchestrationStack(app, `${APP_NAME}-OrchestrationStack`, {
  alias,
})
