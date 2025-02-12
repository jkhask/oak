import { bedrock } from '@cdklabs/generative-ai-cdk-constructs'
import * as cdk from 'aws-cdk-lib'
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'
import * as path from 'path'
import { OAK_INSTRUCTION } from './config/oak-instruction'
interface BedrockStackProps extends cdk.StackProps {
  pokemonLambda: nodejs.NodejsFunction
}

export class BedrockStack extends cdk.Stack {
  alias: bedrock.AgentAlias

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

    this.alias = new bedrock.AgentAlias(this, 'OakAlias', {
      agent,
      description: new Date().toISOString(),
    })
  }
}
