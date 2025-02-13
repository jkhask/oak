import * as cdk from 'aws-cdk-lib'
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2'
import * as apigwv2_integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs'
import * as ssm from 'aws-cdk-lib/aws-ssm'
import { Construct } from 'constructs'
import * as path from 'path'
import {
  AGENT_ID_SSM_PARAMETER_NAME,
  ALIAS_ID_SSM_PARAMETER_NAME,
} from './config/constants'

export class OrchestrationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props)

    const webSocketApi = new apigwv2.WebSocketApi(this, 'AgentApi', {})

    const webSocketApiStage = new apigwv2.WebSocketStage(
      this,
      'AgentApiStage',
      {
        webSocketApi,
        stageName: 'dev',
        autoDeploy: true,
      }
    )

    const agentId = ssm.StringParameter.valueForStringParameter(
      this,
      AGENT_ID_SSM_PARAMETER_NAME
    )
    const aliasId = ssm.StringParameter.valueForStringParameter(
      this,
      ALIAS_ID_SSM_PARAMETER_NAME
    )

    const invocationLambda = new nodejs.NodejsFunction(
      this,
      'InvocationLambda',
      {
        runtime: lambda.Runtime.NODEJS_22_X,
        entry: path.join(__dirname, '../src/lambda/invocation.ts'),
        timeout: cdk.Duration.seconds(60),
        environment: {
          AGENT_ALIAS_ID: aliasId,
          AGENT_ID: agentId,
          WS_ENDPOINT: webSocketApiStage.url,
        },
        bundling: {
          sourceMap: true,
          environment: { NODE_ENV: 'production' },
          externalModules: [
            '@aws-sdk/client-bedrock-agent-runtime',
            '@aws-sdk/client-apigatewaymanagementapi',
          ],
        },
      }
    )

    invocationLambda.role?.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonBedrockFullAccess')
    )
    invocationLambda.role?.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        'AmazonAPIGatewayInvokeFullAccess'
      )
    )

    webSocketApi.addRoute('invoke-agent', {
      integration: new apigwv2_integrations.WebSocketLambdaIntegration(
        'InvokeAgent',
        invocationLambda
      ),
    })

    new cdk.CfnOutput(this, 'WebSocketApiUrl', {
      value: webSocketApiStage.url,
    })
  }
}
