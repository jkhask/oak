import { bedrock } from '@cdklabs/generative-ai-cdk-constructs'
import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { DOWNSTREAM_SPEC } from './config/downstream-spec'
import { MOON_INSTRUCTION } from './config/moon-instruction'
import { IntegrationsStack } from './integrations-stack'

interface BedrockStackProps extends cdk.StackProps {
  integrationsStack: IntegrationsStack
}

export class BedrockStack extends cdk.Stack {
  alias: bedrock.AgentAlias
  agent: bedrock.Agent

  constructor(scope: Construct, id: string, props: BedrockStackProps) {
    super(scope, id, props)

    const cris = bedrock.CrossRegionInferenceProfile.fromConfig({
      geoRegion: bedrock.CrossRegionInferenceProfileRegion.US,
      model: bedrock.BedrockFoundationModel.ANTHROPIC_CLAUDE_3_5_SONNET_V2_0,
    })

    const downstreamActionGroup = new bedrock.AgentActionGroup({
      name: 'downstream-actions',
      executor: bedrock.ActionGroupExecutor.fromlambdaFunction(
        props.integrationsStack.downstreamIntegrationsLambda
      ),
      enabled: true,
      apiSchema: bedrock.ApiSchema.fromInline(DOWNSTREAM_SPEC),
    })

    this.agent = new bedrock.Agent(this, 'Moon', {
      name: 'moon',
      foundationModel: cris,
      description:
        'An agent that trades stocks based on the latest market data',
      instruction: MOON_INSTRUCTION,
      actionGroups: [downstreamActionGroup],
    })

    this.alias = new bedrock.AgentAlias(this, 'MoonAlias', {
      agent: this.agent,
      description: `Latest alias: ${new Date().toISOString()}`,
    })
  }
}
