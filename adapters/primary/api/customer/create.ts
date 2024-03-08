import { customerCommand } from '@application/commands/customer'
import { CommandError } from '@domain/command-error'
import { nanoid } from 'nanoid'
import { useBody, ApiHandler } from 'sst/node/api'
import * as v from 'valibot'

const BodySchema = v.object({
  email: v.string(),
  firstName: v.string(),
  lastName: v.string(),
})

export const handler = ApiHandler(async (ev) => {
  try {
    const body = v.parse(BodySchema, JSON.parse(useBody() ?? '{}'))
    const id = nanoid()

    await customerCommand.create(id, body)

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, id }),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  } catch (error) {
    if (error instanceof v.ValiError) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid body.' }),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    }

    if (error instanceof CommandError) {
      return {
        statusCode: 409,
        body: JSON.stringify({
          message: 'Customer already exists.',
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
