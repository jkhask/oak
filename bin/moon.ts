#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib'
import { BedrockStack } from '../lib/bedrock-stack'
import { IntegrationsStack } from '../lib/integrations-stack'
import { ServiceStack } from '../lib/service-stack'

const app = new cdk.App()

const integrationsStack = new IntegrationsStack(app, 'IntegrationsStack', {})

const bedrockStack = new BedrockStack(app, 'BedrockStack', {
  integrationsStack,
})

new ServiceStack(app, 'ServiceStack', {
  agentAlias: bedrockStack.alias,
})
