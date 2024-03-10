import { ReadStream } from '@application/store/types'
import { CustomerEvent } from '@domain/customer/types'
import { db } from './client'
import { StoreEvent } from '@domain/types'
import { DatabaseError } from '@application/store/database-error'

export const readCustomerStream: ReadStream<CustomerEvent> = async (
  aggregateId
) => {
  try {
    return await db
      .collection('events')
      .find<StoreEvent<CustomerEvent>>({ aggregateId })
      .toArray()
  } catch (error) {
    // todo
    throw new DatabaseError('Unknown error')
  }
}
