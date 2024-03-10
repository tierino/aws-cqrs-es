import { getAggregate } from './aggregate'
import { domain } from '@domain/index'
import { readCustomerStream } from '@adapters/secondary/store'

export const customer = {
  get: getAggregate({
    init: domain.customer.init,
    apply: domain.customer.apply,
    readStream: readCustomerStream,
  }),
}
