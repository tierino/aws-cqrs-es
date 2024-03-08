import { StackContext, use } from 'sst/constructs'
import { Api, Config } from 'sst/constructs'
import { EventStoreStack } from './store'

export function ApiStack({ stack }: StackContext) {
  const api = new Api(stack, 'Api', {
    routes: {
      'POST /customers': 'adapters/primary/api/customer/create.handler',
      'PATCH /customers/{id}': 'adapters/primary/api/customer/update.handler',
    },
    defaults: {
      function: {
        timeout: 20,
      },
    },
  })

  new Config.Parameter(stack, 'CUSTOMER_COMMAND_API_URL', {
    value: api.url,
  })

  return {
    apiUrl: api.url,
  }
}
