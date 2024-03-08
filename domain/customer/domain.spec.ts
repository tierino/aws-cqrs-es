import { describe, it, expect } from 'vitest'
import { domain } from '..'
import { Customer, CustomerEvent } from './types'
import { AggregateMeta } from '@domain/types'

describe('Customer domain events', () => {
  describe('CustomerCreated', () => {
    it('returns the newly created aggregate', () => {
      const id = '12345'

      const aggregate: Customer & AggregateMeta = {
        ...domain.customer.init,
        aggregateId: id,
        version: 0,
      }

      const event: CustomerEvent = {
        type: 'CustomerCreated',
        email: 'chrismoltisanti@email.com',
        firstName: 'christopher',
        id,
        lastName: 'moltisanti',
      }

      expect(
        domain.customer.apply(event, aggregate, {
          aggregateId: id,
          timestamp: new Date(Date.now()),
          version: 0,
        })
      ).toEqual({
        email: event.email,
        firstName: event.firstName,
        id: event.id,
        lastName: event.lastName,
      })
    })
  })

  describe('CustomerUpdated', () => {
    it('returns the updated fields only', () => {
      const id = '12345'

      const aggregate: Customer & AggregateMeta = {
        email: 'pauliegualtieri@email.com',
        firstName: 'paulie',
        id,
        lastName: 'gualtieri',
        aggregateId: id,
        version: 0,
      }

      const event: CustomerEvent = {
        type: 'CustomerUpdated',
        id,
        lastName: 'walnuts',
      }

      expect(
        domain.customer.apply(event, aggregate, {
          aggregateId: id,
          timestamp: new Date(Date.now()),
          version: 0,
        })
      ).toEqual({
        lastName: event.lastName,
      })
    })
  })

  describe('CustomerDeleted', () => {
    it('returns an empty object', () => {
      const id = '12345'
      const version = 6

      const aggregate: Customer & AggregateMeta = {
        email: 'tonysoprano@email.com',
        firstName: 'tony',
        id,
        lastName: 'soprano',
        aggregateId: id,
        version,
      }

      const event: CustomerEvent = {
        type: 'CustomerDeleted',
        id,
      }

      expect(
        domain.customer.apply(event, aggregate, {
          aggregateId: id,
          timestamp: new Date(Date.now()),
          version,
        })
      ).toEqual({})
    })
  })
})
