import { describe, expect, it, vi, beforeEach } from 'vitest'
import { handleEvent, lambdaHandler } from './customer-created'
import { Context, SQSEvent, SQSRecord } from 'aws-lambda'
import { nanoid } from 'nanoid'
import { Event } from '@domain/types'
import { projections } from '@application/repositories/projections'
import { CustomerCreated } from '@domain/customer/types'
import { MalformedEventError } from '@application/repositories/projections/malformed-event-error'
import { InvalidEventError } from '@application/repositories/projections/invalid-event-error'
import { ProjectionError } from '@application/repositories/projections/projection-error'

vi.mock('@application/repositories/projections', () => ({
  projections: {
    customer: {
      create: vi.fn(),
    },
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
          vi.mocked(projections.customer.create).mockRejectedValue(new Error())

          const event: CustomerCreated = {
            type: 'CustomerCreated',
            email: 'tonysoprano@gmail.com',
            firstName: 'tony',
            id: '123',
            lastName: 'soprano',
          }

          const sqsRecord: SQSRecord = {
            body: JSON.stringify(event),
          } as SQSRecord

          await expect(handleEvent(sqsRecord)).rejects.toThrow(ProjectionError)
        })
      })
    })
  })

  describe('given a record containing a valid event', () => {
    const event: CustomerCreated = {
      type: 'CustomerCreated',
      email: 'tonysoprano@gmail.com',
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

      expect(projections.customer.create).toHaveBeenCalledWith(event)
    })

    describe('and the repository call fails', () => {
      it('returns a Promise.allSettled() result containing a single "rejected" item', async () => {
        vi.mocked(projections.customer.create).mockRejectedValue(new Error())

        await expect(lambdaHandler(sqsEvent)).resolves.toEqual([
          expect.objectContaining({ status: 'rejected' }),
        ])
      })
    })

    describe('and the repository call succeeds', () => {
      it('returns a Promise.allSettled() result containing a single "fulfilled" item with the messageId', async () => {
        vi.mocked(projections.customer.create).mockResolvedValue()

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
    const event: CustomerCreated = {
      type: 'CustomerCreated',
      firstName: 'tony',
      id: '123',
      lastName: 'soprano',
    } as CustomerCreated

    const sqsEvent: SQSEvent = {
      Records: [createSqsRecord(event)],
    }

    it('does not invoke the repository', async () => {
      await lambdaHandler(sqsEvent)

      expect(projections.customer.create).not.toHaveBeenCalled()
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

      expect(projections.customer.create).not.toHaveBeenCalled()
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
    const validEvent1: CustomerCreated = {
      type: 'CustomerCreated',
      email: 'tonysoprano@gmail.com',
      firstName: 'tony',
      id: '123',
      lastName: 'soprano',
    }

    const validEvent2: CustomerCreated = {
      type: 'CustomerCreated',
      email: 'christophermoltisanti@gmail.com',
      firstName: 'christopher',
      id: '456',
      lastName: 'moltisanti',
    }

    const invalidEvent: CustomerCreated = {
      type: 'CustomerCreated',
      firstName: 'tony',
      id: '789',
      lastName: 'soprano',
    } as CustomerCreated

    const validSqsRecord1 = createSqsRecord(validEvent1)
    const validSqsRecord2 = createSqsRecord(validEvent2)
    const invalidSqsRecord = createSqsRecord(invalidEvent)

    const sqsEvent: SQSEvent = {
      Records: [validSqsRecord1, validSqsRecord2, invalidSqsRecord],
    }

    it('invokes the repository with only the valid events', async () => {
      await lambdaHandler(sqsEvent)

      expect(projections.customer.create).toHaveBeenNthCalledWith(
        1,
        validEvent1
      )
      expect(projections.customer.create).toHaveBeenNthCalledWith(
        2,
        validEvent2
      )
      expect.assertions(2)
    })

    describe('and all of the repository calls succeed', () => {
      it('returns a Promise.allSettled() result containing a "fulfilled" item with the messageId for each valid event', async () => {
        vi.mocked(projections.customer.create).mockResolvedValue()

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
        vi.mocked(projections.customer.create).mockImplementation(
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
