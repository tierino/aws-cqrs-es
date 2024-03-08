import { SSTConfig } from 'sst'
import { ApiStack } from './infra/api'
import { EventStoreStack } from './infra/store'

export default {
  config(_input) {
    return {
      name: 'aws-cqrs-es',
      region: 'ap-southeast-2',
    }
  },
  stacks(app) {
    app.stack(EventStoreStack).stack(ApiStack)
  },
} satisfies SSTConfig
