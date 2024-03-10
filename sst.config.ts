import { SSTConfig } from 'sst'
import { CommandApiStack } from './infra/command-api'
import { EventStoreStack } from './infra/store'
import { EventTopicStack } from './infra/event-topic'
import { CustomerEventHandlerStack } from './infra/customer-event-handlers'

export default {
  config(_input) {
    return {
      name: 'Sales',
      region: 'ap-southeast-2',
    }
  },
  stacks(app) {
    app
      .stack(EventStoreStack)
      .stack(EventTopicStack)
      .stack(CustomerEventHandlerStack)
      .stack(CommandApiStack)
  },
} satisfies SSTConfig
