import { getAggregate } from './aggregate'
import { domain } from '@domain/index'
import { insertEvent, readCustomerStream } from '@adapters/secondary/store'

const customer = {
  get: getAggregate({
    init: domain.customer.init,
    apply: domain.customer.apply,
    readStream: readCustomerStream,
  }),
}

export const store = {
  append: insertEvent,
  customer,
}
