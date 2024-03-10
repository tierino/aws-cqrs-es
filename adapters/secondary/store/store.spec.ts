import { describe, it, expect, vi } from 'vitest'
import { db } from './client'
import { MongoServerError } from 'mongodb'
import { insertEvent } from './insert-event'
import { DatabaseError } from '@application/repositories/store/database-error'
import { readCustomerStream } from './read-customer-stream'

vi.mock('./client', () => ({
  db: {
    collection: vi.fn().mockReturnValue({
      insertOne: vi.fn(),
      find: vi.fn().mockReturnValue({
        toArray: vi.fn(),
      }),
    }),
  },
}))

describe('MongoDB secondary adapter', () => {
  describe('insertEvent', () => {
    it('throws a DatabaseError if an internal error occurs', async () => {
      const error = new MongoServerError({ code: 1 })
      vi.mocked(db.collection('events').insertOne).mockRejectedValue(error)

      await expect(
        insertEvent({ type: 'TestEvent' }, '123', 0)
      ).rejects.toThrow(DatabaseError)
    })
  })

  describe('readCustomerStream', () => {
    it('throws a DatabaseError if an internal error occurs', async () => {
      const error = new MongoServerError({ code: 1 })
      vi.mocked(db.collection('events').find().toArray).mockRejectedValue(error)

      await expect(readCustomerStream('123')).rejects.toThrow(DatabaseError)
    })
  })
})
