import { db } from './client'
import { StoreEvent } from '@domain/types'
import { MongoServerError } from 'mongodb'
import { VersionConflictError } from '@domain/version-conflict-error'
import { AppendEvent } from '@application/repositories/types'
import { DatabaseError } from '@domain/database-error'

export const insertEvent: AppendEvent = async (event, aggregateId, version) => {
  const writable: StoreEvent<unknown> = {
    aggregateId,
    data: JSON.stringify(event),
    timestamp: new Date(),
    version,
  }

  try {
    await db.collection('events').insertOne(writable)
  } catch (error) {
    if (error instanceof MongoServerError) {
      if (error.code === 11000) {
        throw new VersionConflictError()
      }
      // todo
      throw new DatabaseError('Unknown error')
    }
    throw new DatabaseError('Unknown error')
  }
}
