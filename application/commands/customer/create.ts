import { store } from '@application/repositories/store'
import { CommandError } from '@domain/command-error'
import { Customer, CustomerCreated } from '@domain/customer/types'

export type CreateCustomerProps = Omit<Customer, 'id'>
export const create = async (id: string, props: CreateCustomerProps) => {
  const agg = await store.customer.get(id)

  if (agg.version !== 0) {
    throw new CommandError('Aggregate already exists.')
  }

  const ev: CustomerCreated = {
    type: 'CustomerCreated',
    id,
    ...props,
  }

  await store.append(ev, id, agg.version + 1)
}
