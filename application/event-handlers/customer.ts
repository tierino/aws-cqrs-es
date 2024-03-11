import { createCustomer } from '@adapters/secondary/read-model/create-customer'
import { updateCustomer } from '@adapters/secondary/read-model/update-customer'
import {
  CustomerCreated,
  CustomerDeleted,
  CustomerUpdated,
} from '@domain/customer/types'

export type HandleCustomerCreated = (event: CustomerCreated) => Promise<void>
export const customerCreated: HandleCustomerCreated = async (event) => {
  await createCustomer(event)
}

export type HandleCustomerUpdated = (event: CustomerUpdated) => Promise<void>
export const customerUpdated: HandleCustomerUpdated = async (event) => {
  await updateCustomer(event)
}

export type HandleCustomerDeleted = (event: CustomerDeleted) => Promise<void>
export const customerDeleted: HandleCustomerDeleted = async (event) => {}
