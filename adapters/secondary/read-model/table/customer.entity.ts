import { Entity } from 'dynamodb-toolbox'
import { ReadModel } from './table'

export const CustomerEntity = new Entity({
  table: ReadModel,
  name: 'CustomerEntity',
  attributes: {
    pk: {
      partitionKey: true,
      default: (data: { id: string }) => `CUSTOMER#${data.id}`,
      dependsOn: ['id'],
    },
    sk: {
      sortKey: true,
      default: (data: { id: string }) => `CUSTOMER#${data.id}`,
      dependsOn: ['id'],
    },
    id: {
      type: 'string',
      required: true,
    },
    email: {
      type: 'string',
      required: true,
    },
    firstName: {
      type: 'string',
      required: true,
    },
    lastName: {
      type: 'string',
      required: true,
    },
  },
})
