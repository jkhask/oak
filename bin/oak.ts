#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib'
import { ApiStack } from '../lib/api-stack'
import { BedrockStack } from '../lib/bedrock-stack'
import { IntegrationsStack } from '../lib/integrations-stack'

const APP_NAME = 'Oak'

const app = new cdk.App()

const { pokemonLambda } = new IntegrationsStack(
  app,
  `${APP_NAME}-IntegrationsStack`,
  {}
)

const { invocationLambda } = new BedrockStack(
  app,
  `${APP_NAME}-BedrockStack`,
  {
    pokemonLambda,
  }
)

new ApiStack(app, `${APP_NAME}-ApiStack`, { invocationLambda })
