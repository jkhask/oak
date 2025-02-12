import { bedrock } from '@cdklabs/generative-ai-cdk-constructs'
import * as cdk from 'aws-cdk-lib'
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2'
import * as apigwv2_integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'
import * as path from 'path'

export interface OrchestrationStackProps extends cdk.StackProps {
  alias: bedrock.AgentAlias
}

export class OrchestrationStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props: OrchestrationStackProps
  ) {
    super(scope, id, props)

    const webSocketApi = new apigwv2.WebSocketApi(
      this,
      'AgentApi',
      {}
    )

    const webSocketApiStage = new apigwv2.WebSocketStage(
      this,
      'AgentApiStage',
      {
        webSocketApi,
        stageName: 'dev',
        autoDeploy: true,
      }
    )

    const invocationLambda = new nodejs.NodejsFunction(
      this,
      'InvocationLambda',
      {
        runtime: lambda.Runtime.NODEJS_22_X,
        entry: path.join(__dirname, '../src/lambda/invocation.ts'),
        timeout: cdk.Duration.seconds(60),
        environment: {
          AGENT_ALIAS_ID: props.alias.aliasId,
          AGENT_ID: props.alias.agent.agentId,
          WS_ENDPOINT: webSocketApiStage.url,
        },
        bundling: {
          sourceMap: true,
          environment: { NODE_ENV: 'production' },
          externalModules: ['@aws-sdk/client-bedrock-agent-runtime'],
        },
      }
    )

    invocationLambda.role?.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        'AmazonBedrockFullAccess'
      )
    )

    webSocketApi.addRoute('agent-invoke', {
      integration:
        new apigwv2_integrations.WebSocketLambdaIntegration(
          'InvokeAgent',
          invocationLambda
        ),
      returnResponse: true,
    })

    new cdk.CfnOutput(this, 'WebSocketApiUrl', {
      value: webSocketApiStage.url,
    })
  }
}
