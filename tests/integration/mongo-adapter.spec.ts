import { insertEvent, readCustomerStream } from '@adapters/secondary/store'
import { client, db } from '@adapters/secondary/store/client'
import { StoreEvent } from '@domain/types'
import { describe, it, expect, afterAll, beforeAll, afterEach } from 'vitest'
import { Event } from '@domain/types'
import { VersionConflictError } from '@application/store/version-conflict-error'

const clearStore = async () => {
  await db.collection('events').deleteMany({})
  await db.collection('bookmarks').deleteMany({})
}

describe('MongoDB secondary adapter', () => {
  beforeAll(async () => {
    await clearStore()
  })

  afterEach(async () => {
    await clearStore()
  })

  afterAll(async () => {
    await client.close()
  })

  describe('insertEvent', () => {
    describe('given an event with the same aggregateId and version does not already exist', () => {
      it('persists the aggregateId, version, and event body as a string in JSON format', async () => {
        const aggregateId = '123'
        const event: Event = { type: 'TestEvent' }
        const version = 0

        await insertEvent(event, aggregateId, version)

        const storeEvent = await db.collection('events').findOne({
          aggregateId,
          version,
        })

        expect(storeEvent).toEqual(
          expect.objectContaining({
            aggregateId,
            data: JSON.stringify(event),
            version,
          })
        )
      })
    })

    describe('given an event with the same aggregateId and version already exists', () => {
      it('throws a VersionConflictError', async () => {
        const aggregateId = '123'
        const event: Event = { type: 'TestEvent' }
        const version = 0

        await insertEvent(event, aggregateId, version)
        await expect(insertEvent(event, aggregateId, version)).rejects.toThrow(
          VersionConflictError
        )
      })
    })
  })

  describe('readCustomerStream', () => {
    describe('given no events for the aggregateId exist', () => {
      it('returns an empty array', async () => {
        const res = await readCustomerStream('idonotexist')
        expect(res).toEqual([])
      })
    })

    describe('given multiple events for the aggregateId exist', () => {
      it('returns all events, ordered by version ascending', async () => {
        const aggregateId = '123'
        const events: Array<StoreEvent<Event>> = [
          {
            aggregateId,
            data: { type: 'TestEvent' },
            timestamp: new Date(Date.now()),
            version: 0,
          },
          {
            aggregateId,
            data: { type: 'TestEvent' },
            timestamp: new Date(Date.now()),
            version: 1,
          },
          {
            aggregateId,
            data: { type: 'TestEvent' },
            timestamp: new Date(Date.now()),
            version: 2,
          },
        ]

        await db.collection('events').insertMany(events)

        const storeEvents = await readCustomerStream('123')
        expect(storeEvents).toEqual(events)
      })
    })

    describe('given events for multiple aggregates exist', () => {
      it('only returns those for the target aggregate', async () => {
        const aggregateId = '123'
        const events: Array<StoreEvent<Event>> = [
          {
            aggregateId: '456',
            data: { type: 'TestEvent' },
            timestamp: new Date(Date.now()),
            version: 13,
          },
          {
            aggregateId,
            data: { type: 'TestEvent' },
            timestamp: new Date(Date.now()),
            version: 0,
          },
          {
            aggregateId: '456',
            data: { type: 'TestEvent' },
            timestamp: new Date(Date.now()),
            version: 14,
          },
          {
            aggregateId,
            data: { type: 'TestEvent' },
            timestamp: new Date(Date.now()),
            version: 1,
          },
          {
            aggregateId: '789',
            data: { type: 'TestEvent' },
            timestamp: new Date(Date.now()),
            version: 3,
          },
          {
            aggregateId,
            data: { type: 'TestEvent' },
            timestamp: new Date(Date.now()),
            version: 2,
          },
        ]

        const expectedEvents = events.filter(
          (event) => event.aggregateId === aggregateId
        )

        await db.collection('events').insertMany(events)

        const storeEvents = await readCustomerStream('123')
        expect(storeEvents).toEqual(expectedEvents)
      })
    })
  })
})
