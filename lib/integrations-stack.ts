import * as cdk from 'aws-cdk-lib'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'
import * as path from 'path'

export class IntegrationsStack extends cdk.Stack {
  downstreamIntegrationsLambda: nodejs.NodejsFunction

  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props)

    this.downstreamIntegrationsLambda = new nodejs.NodejsFunction(
      this,
      'DownstreamIntegrationsLambda',
      {
        architecture: lambda.Architecture.ARM_64,
        runtime: lambda.Runtime.NODEJS_22_X,
        entry: path.join(__dirname, '../src/lambda/downstream-integrations.ts'),
        bundling: {
          sourceMap: true,
          format: nodejs.OutputFormat.ESM,
        },
        currentVersionOptions: {
          removalPolicy: cdk.RemovalPolicy.DESTROY,
          retryAttempts: 1,
        },
      }
    )
  }
}
