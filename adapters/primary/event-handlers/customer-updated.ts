import { SQSEvent, SQSRecord } from 'aws-lambda'
import middy from '@middy/core'
import sqsBatch from '@middy/sqs-partial-batch-failure'
import * as v from 'valibot'
import { MalformedEventError } from '@adapters/primary/event-handlers/malformed-event-error'
import { InvalidEventError } from '@adapters/primary/event-handlers/invalid-event-error'
import { eventHandlers } from '@application/event-handlers'
import { EventHandlerError } from '@application/event-handlers/event-handler-error'

const CustomerUpdatedSchema = v.object({
  type: v.literal('CustomerUpdated'),
  firstName: v.optional(v.string()),
  id: v.string(),
  lastName: v.optional(v.string()),
})

export const handleEvent = async (record: SQSRecord) => {
  try {
    const parsed = JSON.parse(record.body)
    const event = v.parse(CustomerUpdatedSchema, parsed)

    await eventHandlers.customerUpdated(event)

    return record
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new MalformedEventError(error.message)
    }

    if (error instanceof v.ValiError) {
      throw new InvalidEventError(error.message)
    }

    if (error instanceof Error) {
      throw new EventHandlerError('CustomerUpdated', error.message)
    }
  }
}

export const lambdaHandler = async (event: SQSEvent) => {
  const promises = event.Records.map(handleEvent)
  return Promise.allSettled(promises)
}

export const handler = middy().use(sqsBatch()).handler(lambdaHandler)
