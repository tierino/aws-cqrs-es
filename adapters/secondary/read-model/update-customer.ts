import { HandleCustomerUpdated } from '@application/event-handlers/customer'
import { CustomerEntity } from './table/customer.entity'
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { ReadModelError } from '@application/event-handlers/read-model-error'

export const updateCustomer: HandleCustomerUpdated = async (event) => {
  try {
    await CustomerEntity.update(
      {
        firstName: event.firstName,
        id: event.id,
        lastName: event.lastName,
      },
      {
        conditions: {
          attr: 'sk',
          exists: true,
        },
      }
    )
  } catch (error) {
    if (error instanceof ConditionalCheckFailedException) {
      throw new ReadModelError(
        `Could not update customer with ID "${event.id}" - customer not found.`
      )
    }

    throw new ReadModelError('Unexpected error.')
  }
}
