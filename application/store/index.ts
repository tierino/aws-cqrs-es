import { insertEvent } from '@adapters/secondary/store'
import { customer } from './customer'

export const store = {
  append: insertEvent,
  customer,
}
