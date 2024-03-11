import { SSTConfig } from 'sst'
import { CommandApiStack } from '@infra/command/command-api'
import { EventStoreStack } from '@infra/command/store'
import { EventTopicStack } from '@infra/query/event-topic'
import { CustomerEventHandlerStack } from '@infra/query/customer-event-handlers'
import { ReadModelStack } from '@infra/query/read-model/table'

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
      .stack(CommandApiStack)
      .stack(ReadModelStack)
      .stack(EventTopicStack)
      .stack(CustomerEventHandlerStack)
  },
} satisfies SSTConfig
