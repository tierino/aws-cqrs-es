import { store } from '@application/repositories/store'
import { describe, it, vi, expect, beforeEach } from 'vitest'
import { customerCommand } from '.'
import { CommandError } from '@application/repositories/store/command-error'
import { domain } from '@domain/index'
import { CreateCustomerProps } from './create'

vi.mock('@application/repositories/store', () => ({
  store: {
    append: vi.fn(),
    customer: {
      get: vi.fn(),
    },
  },
}))

describe('Create customer command', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('throws a CommandError when the aggregate already exists', async () => {
    vi.mocked(store.customer.get).mockResolvedValue({
      aggregateId: '12345',
      email: 'already@exists.com',
      firstName: 'already',
      id: '12345',
      lastName: 'exists',
      version: 4,
    })

    await expect(customerCommand.create).rejects.toThrow(CommandError)
  })

  it(
    'appends a "CustomerCreated" event to the store with the created customer ' +
      'and a version of 1',
    async () => {
      vi.mocked(store.customer.get).mockResolvedValue({
        ...domain.customer.init,
        aggregateId: '',
        version: 0,
      })

      const id = '12345'
      const props: CreateCustomerProps = {
        email: 'test@email.com',
        firstName: 'jon',
        lastName: 'jones',
      }

      await customerCommand.create(id, props)

      expect(vi.mocked(store.append)).toHaveBeenCalledWith(
        {
          email: 'test@email.com',
          firstName: 'jon',
          id: '12345',
          lastName: 'jones',
          type: 'CustomerCreated',
        },
        id,
        1
      )
    }
  )
})
