import { store } from '@application/repositories/store'
import { CommandError } from '@domain/command-error'
import { CustomerUpdated } from '@domain/customer/types'

export type UpdateCustomerProps = {
  firstName?: string
  lastName?: string
}
export const update = async (id: string, props: UpdateCustomerProps) => {
  const agg = await store.customer.get(id)

  if (agg.version === 0) {
    throw new CommandError('Aggregate does not exist.')
  }

  const ev: CustomerUpdated = {
    type: 'CustomerUpdated',
    id,
    ...props,
  }

  await store.append(ev, id, agg.version + 1)
}
