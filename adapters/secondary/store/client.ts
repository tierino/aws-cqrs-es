import { MongoClient } from 'mongodb'

export async function getLocalMongo(dbName: string) {
  const client = await MongoClient.connect('mongodb://127.0.0.1:27017')

  const db = client.db(dbName)

  return { db, client }
}

export const { db, client } = await getLocalMongo('mongo')
