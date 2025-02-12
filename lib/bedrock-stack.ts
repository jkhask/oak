import { bedrock } from '@cdklabs/generative-ai-cdk-constructs'
import * as cdk from 'aws-cdk-lib'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'
import * as path from 'path'
import { OAK_INSTRUCTION } from './config/oak-instruction'
interface BedrockStackProps extends cdk.StackProps {
  pokemonLambda: nodejs.NodejsFunction
}

export class BedrockStack extends cdk.Stack {
  invocationLambda: nodejs.NodejsFunction

  constructor(
    scope: Construct,
    id: string,
    props: BedrockStackProps
  ) {
    super(scope, id, props)

    const cris = bedrock.CrossRegionInferenceProfile.fromConfig({
      geoRegion: bedrock.CrossRegionInferenceProfileRegion.US,
      model:
        bedrock.BedrockFoundationModel
          .ANTHROPIC_CLAUDE_3_5_SONNET_V2_0,
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
    })

    const alias = new bedrock.AgentAlias(this, 'OakAlias', {
      agent,
      description: new Date().toISOString(),
    })

    this.invocationLambda = new nodejs.NodejsFunction(
      this,
      'InvocationLambda',
      {
        runtime: lambda.Runtime.NODEJS_22_X,
        entry: path.join(__dirname, '../src/lambda/invocation.ts'),
        timeout: cdk.Duration.seconds(60),
        environment: {
          AGENT_ALIAS_ID: alias.aliasId,
          AGENT_ID: alias.agent.agentId,
        },
        bundling: {
          sourceMap: true,
          environment: { NODE_ENV: 'production' },
          externalModules: ['@aws-sdk/client-bedrock-agent-runtime'],
        },
      }
    )

    this.invocationLambda.role?.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        'AmazonBedrockFullAccess'
      )
    )
  }
}
