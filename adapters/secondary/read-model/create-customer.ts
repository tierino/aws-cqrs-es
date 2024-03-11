import { HandleCustomerCreated } from '@application/event-handlers/customer'
import { CustomerEntity } from './table/customer.entity'
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { ReadModelError } from '@application/event-handlers/read-model-error'

export const createCustomer: HandleCustomerCreated = async (event) => {
  try {
    await CustomerEntity.put(
      {
        email: event.email,
        firstName: event.firstName,
        id: event.id,
        lastName: event.lastName,
      },
      {
        conditions: {
          attr: 'sk',
          exists: false,
        },
      }
    )
  } catch (error) {
    if (error instanceof ConditionalCheckFailedException) {
      throw new ReadModelError(
        `Could not create customer with ID "${event.id}" - customer already exists.`
      )
    }

    throw new ReadModelError('Unexpected error.')
  }
}
