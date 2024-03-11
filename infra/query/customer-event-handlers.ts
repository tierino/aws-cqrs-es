import { Function, Queue, StackContext, use } from 'sst/constructs'
import { EventTopicStack } from './event-topic'
import { aws_sns as sns } from 'aws-cdk-lib'
import { ReadModelStack } from './read-model/table'

export function CustomerEventHandlerStack({ stack }: StackContext) {
  const { topic } = use(EventTopicStack)
  const { table, READ_MODEL_TABLE_NAME } = use(ReadModelStack)

  /** @todo DLQ handlers */

  /** CustomerCreated */

  const customerCreatedDlq = new Queue(stack, 'CustomerCreatedDlq', {
    cdk: { queue: { fifo: true } },
  })

  const customerCreatedQueue = new Queue(stack, 'CustomerCreated', {
    cdk: {
      queue: {
        fifo: true,
        deadLetterQueue: {
          queue: customerCreatedDlq.cdk.queue,
          maxReceiveCount: 5,
        },
      },
    },
  })

  const customerCreatedHandler = new Function(stack, 'CustomerCreatedHandler', {
    handler: 'adapters/primary/event-handlers/customer-created.handler',
    bind: [table, READ_MODEL_TABLE_NAME],
  })

  customerCreatedQueue.addConsumer(stack, {
    function: customerCreatedHandler,
    cdk: {
      eventSource: {
        reportBatchItemFailures: true,
      },
    },
  })

  /** CustomerUpdated */

  const customerUpdatedDlq = new Queue(stack, 'CustomerUpdatedDlq', {
    cdk: { queue: { fifo: true } },
  })

  const customerUpdatedQueue = new Queue(stack, 'CustomerUpdated', {
    cdk: {
      queue: {
        fifo: true,
        deadLetterQueue: {
          queue: customerUpdatedDlq.cdk.queue,
          maxReceiveCount: 5,
        },
      },
    },
  })

  const customerUpdatedHandler = new Function(stack, 'CustomerUpdatedHandler', {
    handler: 'adapters/primary/event-handlers/customer-updated.handler',
    bind: [table, READ_MODEL_TABLE_NAME],
  })

  customerUpdatedQueue.addConsumer(stack, {
    function: customerUpdatedHandler,
    cdk: {
      eventSource: {
        reportBatchItemFailures: true,
      },
    },
  })

  /** CustomerDeleted */

  const customerDeletedDlq = new Queue(stack, 'CustomerDeletedDlq', {
    cdk: { queue: { fifo: true } },
  })

  const customerDeletedQueue = new Queue(stack, 'CustomerDeleted', {
    cdk: {
      queue: {
        fifo: true,
        deadLetterQueue: {
          queue: customerDeletedDlq.cdk.queue,
          maxReceiveCount: 5,
        },
      },
    },
  })

  const customerDeletedHandler = new Function(
    stack,
    'CustomerDeleteddHandler',
    {
      handler: 'adapters/primary/event-handlers/customer-deleted.handler',
      bind: [table, READ_MODEL_TABLE_NAME],
    }
  )

  customerDeletedQueue.addConsumer(stack, {
    function: customerDeletedHandler,
    cdk: {
      eventSource: {
        reportBatchItemFailures: true,
      },
    },
  })

  topic.addSubscribers(stack, {
    customerCreated: {
      type: 'queue',
      queue: customerCreatedQueue,
      cdk: {
        subscription: {
          filterPolicyWithMessageBody: {
            type: sns.FilterOrPolicy.filter(
              sns.SubscriptionFilter.stringFilter({
                allowlist: ['CustomerCreated'],
              })
            ),
          },
        },
      },
    },
    customerUpdated: {
      type: 'queue',
      queue: customerUpdatedQueue,
      cdk: {
        subscription: {
          filterPolicyWithMessageBody: {
            type: sns.FilterOrPolicy.filter(
              sns.SubscriptionFilter.stringFilter({
                allowlist: ['CustomerUpdated'],
              })
            ),
          },
        },
      },
    },
    customerDeletedQueue: {
      type: 'queue',
      queue: customerDeletedQueue,
      cdk: {
        subscription: {
          filterPolicyWithMessageBody: {
            type: sns.FilterOrPolicy.filter(
              sns.SubscriptionFilter.stringFilter({
                allowlist: ['CustomerDeleted'],
              })
            ),
          },
        },
      },
    },
  })
}
