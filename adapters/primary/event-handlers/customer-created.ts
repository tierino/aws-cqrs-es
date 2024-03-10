import { SQSEvent, SQSRecord } from 'aws-lambda'
import middy from '@middy/core'
import sqsBatch from '@middy/sqs-partial-batch-failure'
import { projections } from '@application/repositories/projections'
import * as v from 'valibot'
import { ProjectionError } from '@application/repositories/projections/projection-error'
import { MalformedEventError } from '@application/repositories/projections/malformed-event-error'
import { InvalidEventError } from '@application/repositories/projections/invalid-event-error'

const CustomerCreatedSchema = v.object({
  type: v.literal('CustomerCreated'),
  email: v.string(),
  firstName: v.string(),
  id: v.string(),
  lastName: v.string(),
})

export const handleEvent = async (record: SQSRecord) => {
  try {
    const parsed = JSON.parse(record.body)
    const event = v.parse(CustomerCreatedSchema, parsed)

    await projections.customer.create(event)

    return record
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new MalformedEventError(error.message)
    }

    if (error instanceof v.ValiError) {
      throw new InvalidEventError(error.message)
    }

    if (error instanceof Error) {
      throw new ProjectionError('CustomerCreated', error.message)
    }
  }
}

export const lambdaHandler = async (event: SQSEvent) => {
  const promises = event.Records.map(handleEvent)
  return Promise.allSettled(promises)
}

export const handler = middy().use(sqsBatch()).handler(lambdaHandler)
