import { Queue, StackContext, use } from 'sst/constructs'
import { EventTopicStack } from './event-topic'
import { aws_sns as sns } from 'aws-cdk-lib'

export function CustomerEventHandlerStack({ stack }: StackContext) {
  const { topic } = use(EventTopicStack)

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
  customerCreatedQueue.addConsumer(stack, {
    function: 'adapters/primary/event-handlers/customer-created.handler',
    cdk: {
      eventSource: {
        reportBatchItemFailures: true,
      },
    },
  })

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
  customerUpdatedQueue.addConsumer(stack, {
    function: 'adapters/primary/event-handlers/customer-updated.handler',
    cdk: {
      eventSource: {
        reportBatchItemFailures: true,
      },
    },
  })

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
  customerDeletedQueue.addConsumer(stack, {
    function: 'adapters/primary/event-handlers/customer-deleted.handler',
    cdk: {
      eventSource: {
        reportBatchItemFailures: true,
      },
    },
  })

  /** @todo DLQ handlers */

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
