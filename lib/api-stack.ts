import * as cdk from 'aws-cdk-lib'
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2'
import * as apigwv2_integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations'
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'

export interface ApiStackProps extends cdk.StackProps {
  invocationLambda: nodejs.NodejsFunction
}

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
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

    webSocketApi.addRoute('agent-invoke', {
      integration:
        new apigwv2_integrations.WebSocketLambdaIntegration(
          'InvokeAgent',
          props.invocationLambda
        ),
      returnResponse: true,
    })

    props.invocationLambda.addEnvironment(
      'WS_ENDPOINT',
      webSocketApiStage.url
    )
  }
}
