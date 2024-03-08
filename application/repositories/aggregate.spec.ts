import { describe, it, vi, beforeEach, expect, MockedFunction } from 'vitest'
import { getAggregate } from './aggregate'
import { ReadStream } from './types'

const readStreamMock: MockedFunction<ReadStream<TestEvent>> = vi.fn()

describe('Aggregate repository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAggregate', () => {
    it('invokes the store adapter to retrieve all events for the aggregate', async () => {
      vi.mocked(readStreamMock).mockResolvedValue([])
      await getTestAggregate('1234')
      expect(readStreamMock).toHaveBeenCalledWith('1234')
    })

    it('throws an error when there is an error thrown by the store adapter', async () => {
      const error = new Error()
      vi.mocked(readStreamMock).mockRejectedValue(error)
      await expect(getTestAggregate).rejects.toThrow(error)
    })

    describe('given there are no events returned from the store', () => {
      it('returns the initial aggregate with version 0', async () => {
        vi.mocked(readStreamMock).mockResolvedValue([])
        const agg = await getTestAggregate('1234')
        expect(agg).toEqual({ ...testInit, aggregateId: '1234', version: 0 })
      })
    })

    describe('given there are events returned by the store', () => {
      it('applies each event to the initial aggregate and returns the result', async () => {
        vi.mocked(readStreamMock).mockResolvedValue([
          {
            aggregateId: '1234',
            data: { type: 'Created', info: 'first' },
            timestamp: new Date(Date.now()),
            version: 0,
          },
          {
            aggregateId: '1234',
            data: { type: 'Updated', info: 'second' },
            timestamp: new Date(Date.now()),
            version: 1,
          },
          {
            aggregateId: '1234',
            data: { type: 'Updated', info: 'third' },
            timestamp: new Date(Date.now()),
            version: 2,
          },
          {
            aggregateId: '1234',
            data: { type: 'Deleted', info: 'fourth' },
            timestamp: new Date(Date.now()),
            version: 3,
          },
        ])

        const agg = await getTestAggregate('1234')

        expect(agg).toEqual({
          aggregateId: '1234',
          created: true,
          deleted: true,
          info: 'fourth',
          updatedTimes: 2,
          version: 3,
        })
      })
    })
  })
})

type TestAggregate = {
  created: boolean
  updatedTimes: number
  deleted: boolean
  info?: string
}

type TestEvent =
  | {
      type: 'Created'
      info?: string
    }
  | {
      type: 'Updated'
      info?: string
    }
  | {
      type: 'Deleted'
      info?: string
    }

const testInit: TestAggregate = {
  created: false,
  deleted: false,
  updatedTimes: 0,
}

const getTestAggregate = getAggregate<TestAggregate, TestEvent>({
  init: testInit,
  readStream: readStreamMock,
  apply: (ev, agg, meta) => {
    switch (ev.type) {
      case 'Created':
        return {
          created: true,
          info: ev.info,
        }

      case 'Updated':
        return {
          updatedTimes: agg.updatedTimes + 1,
          info: ev.info ? ev.info : agg.info,
        }

      case 'Deleted':
        return {
          info: ev.info ? ev.info : agg.info,
          deleted: true,
        }

      default:
        throw new Error()
    }
  },
})
