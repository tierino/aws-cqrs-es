import { customerCommand } from '@application/commands/customer'
import { describe, it, vi, expect, beforeEach } from 'vitest'
import { handler } from './update'
import { APIGatewayProxyEventV2, Context } from 'aws-lambda'

vi.mock('@application/commands/customer', () => ({
  customerCommand: {
    update: vi.fn(),
  },
}))

describe('PATCH /customers/{id} primary adapter', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('returns a 400 if the ID cannot be resolved from the path param', async () => {
    vi.mocked(customerCommand.update).mockRejectedValue(
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
          pathParameters: {
            id: undefined,
          },
        } as unknown as APIGatewayProxyEventV2,
        {} as Context
      )
    ).resolves.toEqual(
      expect.objectContaining({
        statusCode: 400,
      })
    )
  })

  it('returns a 500 when an unhandled error is caught', async () => {
    vi.mocked(customerCommand.update).mockRejectedValue(
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
          pathParameters: {
            id: '123',
          },
        } as unknown as APIGatewayProxyEventV2,
        {} as Context
      )
    ).resolves.toEqual(
      expect.objectContaining({
        statusCode: 500,
      })
    )
  })
})
