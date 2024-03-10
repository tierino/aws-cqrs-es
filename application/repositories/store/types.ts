import {
  Aggregate,
  AggregateMeta,
  Command,
  Event,
  EventMeta,
} from '@domain/types'

export type CommandHandler<
  A extends Aggregate,
  C extends Command,
  E extends Event
> = (aggregate: A, command: C) => Promise<E>

export type StoreEvent<T = unknown> = EventMeta & { data: T }

export type GetAggregate<A extends Aggregate> = (
  id: string
) => Promise<A & AggregateMeta>

export type ReadStream<E extends Event> = (
  aggregateId: string,
  startPosition?: number
) => Promise<Array<StoreEvent<E>>>

export type AppendEvent = (
  event: Event,
  aggregateId: string,
  version: number
) => Promise<void>

export type ApplyEvent<A, E> = (
  ev: E,
  agg: A & AggregateMeta,
  meta: EventMeta
) => Partial<A>
