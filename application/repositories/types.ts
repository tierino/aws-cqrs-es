import { Event, EventMeta } from '@domain/types'

export type Aggregate = {}
export type AggregateMeta = { aggregateId: string; version: number }

export type Command = { type: string }

export type CommandHandler<
  A extends Aggregate,
  C extends Command,
  E extends Event
> = (aggregate: A, command: C) => Promise<E>

export type StoreEvent<T = unknown> = EventMeta & { data: T }

export type ReadStream<E extends Event> = (
  aggregateId: string,
  startPosition?: number
) => Promise<Array<StoreEvent<E>>>

export type AppendEvent = (
  event: Event,
  aggregateId: string,
  version: number
) => Promise<void>

/** @deprecated */
export type PublishEvent = (
  event: Event,
  aggregateId: string,
  version: number
) => Promise<void>

export type ApplyEvent<A, E> = (
  ev: E,
  agg: A & AggregateMeta,
  meta: EventMeta
) => Partial<A>
