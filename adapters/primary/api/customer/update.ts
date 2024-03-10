import { CommandError } from '@application/commands/command-error'
import { customerCommand } from '@application/commands/customer'
import { useBody, ApiHandler, usePathParam } from 'sst/node/api'
import * as v from 'valibot'

const BodySchema = v.object({
  firstName: v.optional(v.string()),
  lastName: v.optional(v.string()),
})

export const handler = ApiHandler(async () => {
  try {
    const id = usePathParam('id')
    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Could not resolve ID from request.',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    }

    const body = v.parse(BodySchema, JSON.parse(useBody() ?? '{}'))

    await customerCommand.update(id, body)

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  } catch (error) {
    if (error instanceof v.ValiError) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Invalid body.',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    }

    if (error instanceof CommandError) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: 'Customer not found.',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal server error.',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  }
})
