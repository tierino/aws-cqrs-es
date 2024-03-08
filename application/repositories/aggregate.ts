/** @todo clean up types */
import { Event, EventMeta } from '@domain/types'
import {
  Aggregate,
  AggregateMeta,
  ApplyEvent,
  ReadStream,
  StoreEvent,
} from './types'

type GetAggregate<A extends Aggregate> = (
  id: string
) => Promise<A & AggregateMeta>

export type GetAggregateProps<A extends Aggregate, E extends Event> = {
  init: A
  apply: ApplyEvent<A, E>
  readStream: ReadStream<E>
}

export const getAggregate =
  <A extends Aggregate, E extends Event>(
    props: GetAggregateProps<A, E>
  ): GetAggregate<A> =>
  async (id) => {
    const events = await props.readStream(id)
    let version = 0

    const eventCount = events.length
    if (eventCount) {
      version = events[eventCount - 1].version
    }

    let initAgg: A & AggregateMeta = {
      ...props.init,
      aggregateId: id,
      version,
    }

    return events.reduce(
      (next, ev) => ({
        ...next,
        ...props.apply(ev.data, next, toMeta(ev)),
        version: ev.version,
        aggregateId: ev.aggregateId,
      }),
      initAgg
    )
  }

function toMeta(ev: StoreEvent): EventMeta {
  return {
    aggregateId: ev.aggregateId,
    timestamp: ev.timestamp,
    version: ev.version,
  }
}
