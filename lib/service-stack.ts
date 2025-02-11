import { AgentAlias } from '@cdklabs/generative-ai-cdk-constructs/lib/cdk-lib/bedrock'
import * as cdk from 'aws-cdk-lib'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'
import * as path from 'path'

export interface ServiceStackProps extends cdk.StackProps {
  agentAlias: AgentAlias
}

export class ServiceStack extends cdk.Stack {
  agentInvocationLambda: nodejs.NodejsFunction

  constructor(scope: Construct, id: string, props: ServiceStackProps) {
    super(scope, id, props)

    this.agentInvocationLambda = new nodejs.NodejsFunction(
      this,
      'AgentInvocationLambda',
      {
        runtime: lambda.Runtime.NODEJS_22_X,
        entry: path.join(__dirname, '../src/lambda/agent-invocation.ts'),
        timeout: cdk.Duration.seconds(60),
        environment: {
          AGENT_ALIAS_ID: props.agentAlias.aliasId,
          AGENT_ID: props.agentAlias.agent.agentId,
        },
        bundling: {
          sourceMap: true,
          environment: { NODE_ENV: 'production' },
          externalModules: ['@aws-sdk/client-bedrock-agent-runtime'],
        },
      }
    )

    this.agentInvocationLambda.role?.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonBedrockFullAccess')
    )
  }
}
