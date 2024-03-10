import {
  CustomerCreated,
  CustomerDeleted,
  CustomerUpdated,
} from '@domain/customer/types'

export type HandleCustomerCreated = (event: CustomerCreated) => Promise<void>
export const customerCreated: HandleCustomerCreated = async (event) => {}

export type HandleCustomerUpdated = (event: CustomerUpdated) => Promise<void>
export const customerUpdated: HandleCustomerUpdated = async (event) => {}

export type HandleCustomerDeleted = (event: CustomerDeleted) => Promise<void>
export const customerDeleted: HandleCustomerDeleted = async (event) => {}
