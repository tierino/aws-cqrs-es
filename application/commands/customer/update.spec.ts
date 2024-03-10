import { store } from '@application/store'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { customerCommand } from '.'
import { domain } from '@domain/index'
import { CommandError } from '@application/commands/command-error'
import { UpdateCustomerProps } from './update'

vi.mock('@application/store', () => ({
  store: {
    append: vi.fn(),
    customer: {
      get: vi.fn(),
    },
  },
}))

describe('Update customer command', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('throws a CommandError when the aggregate does not exist', async () => {
    vi.mocked(store.customer.get).mockResolvedValue({
      ...domain.customer.init,
      aggregateId: '',
      version: 0,
    })

    await expect(customerCommand.update).rejects.toThrow(CommandError)
  })

  it(
    'appends a "CustomerUpdated" event to the store containing the updated fields ' +
      'and an incremented version',
    async () => {
      const id = '12345'
      const version = 4

      vi.mocked(store.customer.get).mockResolvedValue({
        aggregateId: id,
        email: 'tony@email.com',
        firstName: 'tony',
        id,
        lastName: 'soprano',
        version,
      })

      const props: UpdateCustomerProps = {
        lastName: 'montana',
      }

      await customerCommand.update(id, props)

      expect(vi.mocked(store.append)).toHaveBeenCalledWith(
        {
          id,
          lastName: 'montana',
          type: 'CustomerUpdated',
        },
        id,
        version + 1
      )
    }
  )
})
