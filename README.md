# Bedrock Agent with CDK

This is a POC project that demonstrates how to quickly set up agentic architecture using the CDK.

## Installation Instructions

We assume you have the aws cli setup and configured for your aws account.

- `npm i` Install dependencies
- `npx cdk bootstrap` Bootstrap the environment

## Deployment Instructions

1. `npx cdk deploy Oak-BedrockStack` deploy the IntegrationsStack and BedrockStack (BedrockStack depends on IntegrationsStack)
2. `npx cdk deploy Oak-OrchestrationStack` deploy the OrchestrationStack

From then on, you only need to deploy specific stacks depending on where you make changes.

## Usage

The deployment of OrchestrationStack should output a websocket api endpoint.
You can hit the websocket api however you'd like (Postman, wscat, etc.).
It is setup to receive messages in the following format:
`{"action": "invoke-agent", "sessionId": "abc", "prompt":"Hi, who are you?"}`
