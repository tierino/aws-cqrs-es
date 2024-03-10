import { SQSEvent } from 'aws-lambda'
import middy from '@middy/core'
import sqsBatch from '@middy/sqs-partial-batch-failure'

export const lambdaHandler = async (event: SQSEvent) => {
  /** @todo */
}

export const handler = middy().use(sqsBatch()).handler(lambdaHandler)
