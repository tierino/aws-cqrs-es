import { createCustomer } from '@adapters/secondary/read-model/create-customer'
import { CustomerEntity } from '@adapters/secondary/read-model/table/customer.entity'
import { ReadModel } from '@adapters/secondary/read-model/table/table'
import { updateCustomer } from '@adapters/secondary/read-model/update-customer'
import { ReadModelError } from '@application/event-handlers/read-model-error'
import {
  Customer,
  CustomerCreated,
  CustomerUpdated,
} from '@domain/customer/types'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

describe('DynamoDB secondary adapter', () => {
  const successfulCreateId = '123'
  const conditionFailCreateId = '456'
  const successfulUpdateId = '789'
  const conditionFailUpdateId = '012'

  beforeAll(async () => {
    await ReadModel.batchWrite([
      CustomerEntity.deleteBatch({ id: '123' }),
      CustomerEntity.deleteBatch({ id: '456' }),
    ])
  })

  afterAll(async () => {
    await ReadModel.batchWrite([
      CustomerEntity.deleteBatch({ id: '123' }),
      CustomerEntity.deleteBatch({ id: '456' }),
    ])
  })

  describe('createCustomer', () => {
    describe('given the customer does not exist', () => {
      it('creates a customer', async () => {
        const event: CustomerCreated = {
          email: 'silviodante@gmail.com',
          firstName: 'silvio',
          id: successfulCreateId,
          lastName: 'dante',
          type: 'CustomerCreated',
        }

        await createCustomer(event)

        const { Item } = await CustomerEntity.get({
          id: event.id,
        })

        expect(Item).toEqual(
          expect.objectContaining({
            email: event.email,
            firstName: event.firstName,
            id: event.id,
            lastName: event.lastName,
          })
        )
      })
    })

    describe('given the customer already exists', () => {
      it('throws a ReadModelError', async () => {
        const event: CustomerCreated = {
          email: 'silviodante@gmail.com',
          firstName: 'silvio',
          id: conditionFailCreateId,
          lastName: 'dante',
          type: 'CustomerCreated',
        }

        await CustomerEntity.put({
          email: event.email,
          firstName: event.firstName,
          id: event.id,
          lastName: event.lastName,
        })
        await expect(createCustomer(event)).rejects.toThrow(ReadModelError)
      })
    })
  })

  describe('updateCustomer', () => {
    describe('given the customer does not exist', () => {
      it('throws a ReadModelError', async () => {
        const event: CustomerUpdated = {
          firstName: 'silvio',
          id: conditionFailUpdateId,
          lastName: 'dante',
          type: 'CustomerUpdated',
        }

        await expect(updateCustomer(event)).rejects.toThrow(ReadModelError)
      })
    })

    describe('given the customer exists', () => {
      it('updates the customer', async () => {
        const customer: Customer = {
          email: 'silviodante@gmail.com',
          firstName: 'silvio',
          id: successfulUpdateId,
          lastName: 'dante',
        }

        await CustomerEntity.put(customer)

        const event: CustomerUpdated = {
          firstName: 'silvio',
          id: successfulUpdateId,
          lastName: 'dante',
          type: 'CustomerUpdated',
        }

        await updateCustomer(event)

        const { Item } = await CustomerEntity.get({
          id: event.id,
        })

        expect(Item).toEqual(
          expect.objectContaining({
            email: customer.email,
            firstName: event.firstName,
            id: event.id,
            lastName: event.lastName,
          })
        )
      })
    })
  })
})
