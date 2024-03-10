import { customerCommand } from '@application/commands/customer'
import { CommandError } from '@application/repositories/store/command-error'
import { describe, it, vi, expect, beforeEach } from 'vitest'
import { handler } from './create'
import { APIGatewayProxyEventV2, Context } from 'aws-lambda'

vi.mock('@application/commands/customer', () => ({
  customerCommand: {
    create: vi.fn(),
  },
}))

describe('POST /customers primary adapter', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('returns a 409 if the aggregate already exists', async () => {
    vi.mocked(customerCommand.create).mockRejectedValue(
      new CommandError('Aggregate already exists.')
    )

    await expect(
      handler(
        {
          body: JSON.stringify({
            email: 'test',
            firstName: 'test',
            lastName: 'test',
          }),
        } as APIGatewayProxyEventV2,
        {} as Context
      )
    ).resolves.toEqual(
      expect.objectContaining({
        statusCode: 409,
      })
    )
  })

  it('returns a 500 when an unhandled error is caught', async () => {
    vi.mocked(customerCommand.create).mockRejectedValue(
      new Error('Some unexpected error.')
    )

    await expect(
      handler(
        {
          body: JSON.stringify({
            email: 'test',
            firstName: 'test',
            lastName: 'test',
          }),
        } as APIGatewayProxyEventV2,
        {} as Context
      )
    ).resolves.toEqual(
      expect.objectContaining({
        statusCode: 500,
      })
    )
  })
})
