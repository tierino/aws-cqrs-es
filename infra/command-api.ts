import { StackContext } from 'sst/constructs'
import { Api, Config } from 'sst/constructs'

export function CommandApiStack({ stack }: StackContext) {
  const api = new Api(stack, 'CommandApi', {
    routes: {
      'POST /customers': 'adapters/primary/api/customer/create.handler',
      'PATCH /customers/{id}': 'adapters/primary/api/customer/update.handler',
    },
  })

  new Config.Parameter(stack, 'CUSTOMER_COMMAND_API_URL', {
    value: api.url,
  })
}
