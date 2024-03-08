import { describe, it, expect, afterAll } from 'vitest'
import { Config } from 'sst/node/config'
import { db } from '@adapters/secondary/store/client'

const clearStore = async () => {
  await db.collection('events').deleteMany({})
  await db.collection('bookmarks').deleteMany({})
}

describe('Command API: Customers', () => {
  const url = `${Config.CUSTOMER_COMMAND_API_URL}/customers`

  afterAll(async () => {
    await clearStore()
  })

  describe('POST /customers', () => {
    describe('given a valid request body', () => {
      it('returns a 200 with the ID in the body', async () => {
        const res = await fetch(url, {
          method: 'POST',
          body: JSON.stringify({
            email: 'test@customer.com',
            firstName: 'test',
            lastName: 'customer',
          }),
        })

        const data = await res.json()
        expect(data).toEqual({
          success: true,
          id: expect.any(String),
        })
        expect(res.status).toBe(200)
        expect.assertions(2)
      })
    })

    describe('given an invalid request body', () => {
      it('returns a 400', async () => {
        const res = await fetch(url, {
          method: 'POST',
          body: JSON.stringify({
            invalid: 'body',
          }),
        })

        const data = await res.json()
        expect(data).toEqual({
          message: 'Invalid body.',
        })
        expect(res.status).toBe(400)
        expect.assertions(2)
      })
    })
  })

  describe('PATCH /customers/{id}', () => {
    describe('given a valid request body', () => {
      describe('and the customer exists', () => {
        it('returns a 200', async () => {
          const createRes = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({
              email: 'test@customer.com',
              firstName: 'test',
              lastName: 'customer',
            }),
          })

          const { id } = (await createRes.json()) as { id: string }
          expect(id).toBeDefined()

          const updateRes = await fetch(`${url}/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({
              firstName: 'updated',
            }),
          })

          const data = await updateRes.json()
          expect(data).toEqual({
            success: true,
          })
          expect(updateRes.status).toBe(200)
          expect.assertions(3)
        })
      })

      describe('and the customer does not exist', () => {
        it('returns a 404', async () => {
          const res = await fetch(`${url}/idontexist`, {
            method: 'POST',
            body: JSON.stringify({
              firstName: 'test',
            }),
          })

          const data = await res.json()
          expect(data).toEqual({
            message: 'Not Found',
          })
          expect(res.status).toBe(404)
          expect.assertions(2)
        })
      })
    })

    describe('given an invalid request body', () => {
      describe('and the customer exists', () => {
        it('returns a 400', async () => {
          const createRes = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({
              email: 'test@customer.com',
              firstName: 'test',
              lastName: 'customer',
            }),
          })

          const { id } = (await createRes.json()) as { id: string }
          expect(id).toBeDefined()

          const res = await fetch(`${url}/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({
              firstName: {
                invalid: 'nested field',
              },
            }),
          })

          const data = await res.json()
          expect(data).toEqual({
            message: 'Invalid body.',
          })
          expect(res.status).toBe(400)
          expect.assertions(3)
        })
      })

      describe('and the customer does not exist', () => {
        it('returns a 400', async () => {
          const res = await fetch(`${url}/idontexist`, {
            method: 'PATCH',
            body: JSON.stringify({
              firstName: {
                invalid: 'nested field',
              },
            }),
          })

          const data = await res.json()
          expect(data).toEqual({
            message: 'Invalid body.',
          })
          expect(res.status).toBe(400)
          expect.assertions(2)
        })
      })
    })
  })
})
