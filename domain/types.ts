export type Aggregate = {}
export type AggregateMeta = { aggregateId: string; version: number }

export type Command = { type: string }

export type Event = { type: string }
export type EventMeta = {
  version: number
  timestamp: Date
  aggregateId: string
}

export type StoreEvent<T = unknown> = EventMeta & { data: T }

export type ApplyEvent<A, E> = (
  ev: E,
  agg: A & AggregateMeta,
  meta: EventMeta
) => Partial<A>
