import * as cdk from 'aws-cdk-lib'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'

export class DatabaseStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props)

    new dynamodb.TableV2(this, 'ConversationDetailsTable', {
      partitionKey: {
        name: 'userId ',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'connectionId ',
        type: dynamodb.AttributeType.STRING,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })
  }
}
