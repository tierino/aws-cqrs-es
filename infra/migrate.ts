import { MongoClient, Timestamp } from 'mongodb'

export type EventMeta = {
  stream: string
  version: number
  timestamp: Date
  aggregateId: string
}

export type StoreEvent<T = unknown> = EventMeta & { data: T }

export type Bookmark = {
  bookmark: string
  position: Timestamp
}

export async function getLocalMongo(dbName: string) {
  const client = await MongoClient.connect('mongodb://127.0.0.1:27017')

  const db = client.db(dbName)

  return { db, client }
}

async function migrate() {
  const { db, client } = await getLocalMongo('mongo')

  try {
    await db.dropDatabase()
    const events = db.collection<StoreEvent<any>>('events')
    await events.createIndex(
      { aggregateId: 1, version: 1 },
      { name: 'id-version-idx', unique: true }
    )

    const bookmarks = db.collection<Bookmark>('bookmarks')
    await bookmarks.createIndex(
      { bookmark: 1 },
      { name: 'bookmark-idx', unique: true }
    )
  } finally {
    await client.close()
  }
}

migrate()
  .then(() => {
    console.log('Migrated local MongoDB database.')
  })
  .catch((reason) => {
    console.error(reason)
  })
