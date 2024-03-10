import { Config, StackContext, Topic } from 'sst/constructs'

export function EventTopicStack({ stack }: StackContext) {
  const topic = new Topic(stack, 'Events', {
    cdk: {
      topic: {
        fifo: true,
      },
    },
  })

  new Config.Parameter(stack, 'EVENT_TOPIC_ARN', {
    value: topic.topicArn,
  })

  return {
    topic,
  }
}
