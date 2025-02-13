import { bedrock } from '@cdklabs/generative-ai-cdk-constructs'
import * as cdk from 'aws-cdk-lib'
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs'
import * as ssm from 'aws-cdk-lib/aws-ssm'
import { Construct } from 'constructs'
import * as path from 'path'
import {
  AGENT_ID_SSM_PARAMETER_NAME,
  ALIAS_ID_SSM_PARAMETER_NAME,
} from './config/constants'
import { OAK_INSTRUCTION } from './config/oak-instruction'

interface BedrockStackProps extends cdk.StackProps {
  pokemonLambda: nodejs.NodejsFunction
}

export class BedrockStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: BedrockStackProps) {
    super(scope, id, props)

    const cris = bedrock.CrossRegionInferenceProfile.fromConfig({
      geoRegion: bedrock.CrossRegionInferenceProfileRegion.US,
      model: bedrock.BedrockFoundationModel.ANTHROPIC_CLAUDE_3_5_SONNET_V1_0,
    })

    const pokemonActionGroup = new bedrock.AgentActionGroup({
      name: 'pokemon-actions',
      executor: bedrock.ActionGroupExecutor.fromlambdaFunction(
        props.pokemonLambda
      ),
      enabled: true,
      apiSchema: bedrock.ApiSchema.fromLocalAsset(
        path.join(__dirname, 'schema/pokemon-spec.yml')
      ),
    })

    const agent = new bedrock.Agent(this, 'Oak', {
      name: 'oak',
      foundationModel: cris,
      description:
        'The Pokemon Professor, who specializes in the study of Pokemon',
      instruction: OAK_INSTRUCTION,
      actionGroups: [pokemonActionGroup],
      userInputEnabled: true,
    })

    const alias = new bedrock.AgentAlias(this, 'OakAlias', {
      agent,
      description: new Date().toISOString(),
    })

    // Place the IDs of the agent and alias in SSM parameters
    // This is necessary to decouple the OrchestrationStack from the BedrockStack
    new ssm.StringParameter(this, 'AgentAliasId', {
      parameterName: ALIAS_ID_SSM_PARAMETER_NAME,
      stringValue: alias.aliasId,
    })
    new ssm.StringParameter(this, 'AgentId', {
      parameterName: AGENT_ID_SSM_PARAMETER_NAME,
      stringValue: agent.agentId,
    })
  }
}
