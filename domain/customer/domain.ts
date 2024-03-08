import { ApplyEvent } from '@domain/types'
import { Customer, CustomerEvent } from './types'

const init: Customer = {
  email: '',
  firstName: '',
  id: '',
  lastName: '',
}

const apply: ApplyEvent<Customer, CustomerEvent> = (ev, agg, _) => {
  switch (ev.type) {
    case 'CustomerCreated':
      return {
        id: ev.id,
        email: ev.email,
        firstName: ev.firstName,
        lastName: ev.lastName,
      }

    case 'CustomerDeleted':
      return {}

    case 'CustomerUpdated':
      return {
        ...(ev.firstName ? { firstName: ev.firstName } : {}),
        ...(ev.lastName ? { lastName: ev.lastName } : {}),
      }

    default:
      return {}
  }
}

export const customer = { init, apply }
