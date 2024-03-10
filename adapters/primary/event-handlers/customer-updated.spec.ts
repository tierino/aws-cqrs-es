import { describe, expect, it, vi, beforeEach } from 'vitest'
import { handleEvent, lambdaHandler } from './customer-updated'
import { SQSEvent, SQSRecord } from 'aws-lambda'
import { nanoid } from 'nanoid'
import { Event } from '@domain/types'
import { CustomerUpdated } from '@domain/customer/types'
import { MalformedEventError } from '@adapters/primary/event-handlers/malformed-event-error'
import { InvalidEventError } from '@adapters/primary/event-handlers/invalid-event-error'
import { eventHandlers } from '@application/event-handlers'
import { EventHandlerError } from '@application/event-handlers/event-handler-error'

vi.mock('@application/event-handlers', () => ({
  eventHandlers: {
    customerUpdated: vi.fn(),
  },
}))

const createSqsRecord = (event: Event): SQSRecord =>
  ({
    body: JSON.stringify(event),
    messageId: nanoid(),
  } as SQSRecord)

describe('SQS event lambdaHandler primary adapter', () => {
  beforeEach(async () => {
    vi.resetAllMocks()
  })

  describe('handleEvent error handling', () => {
    describe('given an SQS record with a malformed event', () => {
      it('throws an MalformedEventError', async () => {
        const sqsRecord: SQSRecord = {
          body: '} malformed json',
        } as SQSRecord

        await expect(handleEvent(sqsRecord)).rejects.toThrow(
          MalformedEventError
        )
      })
    })

    describe('given an SQS record with an invalid event', () => {
      it('throws a InvalidEventError', async () => {
        const sqsRecord: SQSRecord = {
          body: JSON.stringify({ type: 'iamnotvalid' }),
        } as SQSRecord

        await expect(handleEvent(sqsRecord)).rejects.toThrow(InvalidEventError)
      })
    })

    describe('given an SQS record with a valid event', () => {
      describe('and the repository call fails', () => {
        it('throws a ProjectionError', async () => {
          vi.mocked(eventHandlers.customerUpdated).mockRejectedValue(
            new Error()
          )

          const event: CustomerUpdated = {
            type: 'CustomerUpdated',
            firstName: 'tony',
            id: '123',
            lastName: 'soprano',
          }

          const sqsRecord: SQSRecord = {
            body: JSON.stringify(event),
          } as SQSRecord

          await expect(handleEvent(sqsRecord)).rejects.toThrow(
            EventHandlerError
          )
        })
      })
    })
  })

  describe('given a record containing a valid event', () => {
    const event: CustomerUpdated = {
      type: 'CustomerUpdated',
      firstName: 'tony',
      id: '123',
      lastName: 'soprano',
    }

    const sqsRecord = createSqsRecord(event)
    const sqsEvent: SQSEvent = {
      Records: [sqsRecord],
    }

    it('invokes the repository with the event', async () => {
      await lambdaHandler(sqsEvent)

      expect(eventHandlers.customerUpdated).toHaveBeenCalledWith(event)
    })

    describe('and the repository call fails', () => {
      it('returns a Promise.allSettled() result containing a single "rejected" item', async () => {
        vi.mocked(eventHandlers.customerUpdated).mockRejectedValue(new Error())

        await expect(lambdaHandler(sqsEvent)).resolves.toEqual([
          expect.objectContaining({ status: 'rejected' }),
        ])
      })
    })

    describe('and the repository call succeeds', () => {
      it('returns a Promise.allSettled() result containing a single "fulfilled" item with the messageId', async () => {
        vi.mocked(eventHandlers.customerUpdated).mockResolvedValue()

        await expect(lambdaHandler(sqsEvent)).resolves.toEqual([
          {
            status: 'fulfilled',
            value: expect.objectContaining({ messageId: sqsRecord.messageId }),
          },
        ])
      })
    })
  })

  describe('given a record containing an invalid event', () => {
    const event: CustomerUpdated = {
      type: 'CustomerUpdated',
      firstName: 'tony',
      lastName: 'soprano',
    } as CustomerUpdated

    const sqsEvent: SQSEvent = {
      Records: [createSqsRecord(event)],
    }

    it('does not invoke the repository', async () => {
      await lambdaHandler(sqsEvent)

      expect(eventHandlers.customerUpdated).not.toHaveBeenCalled()
    })

    it('returns a Promise.allSettled() result containing a single "rejected" item', async () => {
      await expect(lambdaHandler(sqsEvent)).resolves.toEqual([
        expect.objectContaining({
          status: 'rejected',
        }),
      ])
    })
  })

  describe('given a record containing a malformed event', () => {
    const sqsEvent: SQSEvent = {
      Records: [
        {
          body: '} malformed json',
          messageId: nanoid(),
        },
      ],
    } as SQSEvent

    it('does not invoke the repository', async () => {
      await lambdaHandler(sqsEvent)

      expect(eventHandlers.customerUpdated).not.toHaveBeenCalled()
    })

    it('returns a Promise.allSettled() result containing a single "rejected" item', async () => {
      await expect(lambdaHandler(sqsEvent)).resolves.toEqual([
        expect.objectContaining({
          status: 'rejected',
        }),
      ])
    })
  })

  describe('given multiple records containing both valid and invalid events', () => {
    const validEvent1: CustomerUpdated = {
      type: 'CustomerUpdated',
      firstName: 'tony',
      id: '123',
      lastName: 'soprano',
    }

    const validEvent2: CustomerUpdated = {
      type: 'CustomerUpdated',
      firstName: 'christopher',
      id: '456',
      lastName: 'moltisanti',
    }

    const invalidEvent: CustomerUpdated = {
      type: 'CustomerUpdated',
      firstName: 'tony',
      lastName: 'soprano',
    } as CustomerUpdated

    const validSqsRecord1 = createSqsRecord(validEvent1)
    const validSqsRecord2 = createSqsRecord(validEvent2)
    const invalidSqsRecord = createSqsRecord(invalidEvent)

    const sqsEvent: SQSEvent = {
      Records: [validSqsRecord1, validSqsRecord2, invalidSqsRecord],
    }

    it('invokes the repository with only the valid events', async () => {
      await lambdaHandler(sqsEvent)

      expect(eventHandlers.customerUpdated).toHaveBeenNthCalledWith(
        1,
        validEvent1
      )
      expect(eventHandlers.customerUpdated).toHaveBeenNthCalledWith(
        2,
        validEvent2
      )
      expect.assertions(2)
    })

    describe('and all of the repository calls succeed', () => {
      it('returns a Promise.allSettled() result containing a "fulfilled" item with the messageId for each valid event', async () => {
        vi.mocked(eventHandlers.customerUpdated).mockResolvedValue()

        await expect(lambdaHandler(sqsEvent)).resolves.toEqual(
          expect.arrayContaining([
            {
              status: 'fulfilled',
              value: expect.objectContaining({
                messageId: validSqsRecord1.messageId,
              }),
            },
            {
              status: 'fulfilled',
              value: expect.objectContaining({
                messageId: validSqsRecord2.messageId,
              }),
            },
            expect.objectContaining({ status: 'rejected' }),
          ])
        )
      })
    })

    describe('and some of the repository calls fail', () => {
      it('returns a Promise.allSettled() result containing a "fulfilled" item with the messageId only for events for which the repository call succeeded', async () => {
        // Mock repository function to throw for only the first valid record
        vi.mocked(eventHandlers.customerUpdated).mockImplementation(
          async (event) => {
            if (event.id === validEvent1.id) {
              throw new Error()
            }
          }
        )

        // Only the second valid record should be "fulfilled"
        await expect(lambdaHandler(sqsEvent)).resolves.toEqual(
          expect.arrayContaining([
            {
              status: 'fulfilled',
              value: expect.objectContaining({
                messageId: validSqsRecord2.messageId,
              }),
            },
            expect.objectContaining({ status: 'rejected' }),
            expect.objectContaining({ status: 'rejected' }),
          ])
        )
      })
    })
  })
})
