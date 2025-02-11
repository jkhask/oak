export const DOWNSTREAM_SPEC = JSON.stringify({
  openapi: '3.0.0',
  info: {
    title: 'Downstream Action API',
    version: '1.0.0',
    description: 'API for invoking downstream actions',
  },
  paths: {
    '/hello': {
      get: {
        summary: 'Get a hello world message',
        description: 'Simple endpoint that returns a hello world message',
        operationId: 'getHello',
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      description: 'Hello world message',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
})
