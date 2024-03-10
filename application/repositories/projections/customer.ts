import {
  CustomerCreated,
  CustomerDeleted,
  CustomerUpdated,
} from '@domain/customer/types'

export type CustomerProjectionCreate = (event: CustomerCreated) => Promise<void>
export const create: CustomerProjectionCreate = async (event) => {}

export type CustomerProjectionUpdate = (event: CustomerUpdated) => Promise<void>
export const update: CustomerProjectionUpdate = async (event) => {}

export type CustomerProjectionDelete = (event: CustomerDeleted) => Promise<void>
export const _delete: CustomerProjectionDelete = async (event) => {}

export const customer = {
  create,
  update,
  delete: _delete,
}
