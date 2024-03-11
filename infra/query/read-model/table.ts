import { RemovalPolicy } from 'aws-cdk-lib'
import { Config, StackContext, Table } from 'sst/constructs'

export function ReadModelStack({ stack }: StackContext) {
  const table = new Table(stack, 'ReadModel', {
    cdk: {
      table: { removalPolicy: RemovalPolicy.DESTROY },
    },
    fields: {
      pk: 'string',
      sk: 'string',
    },
    primaryIndex: { partitionKey: 'pk', sortKey: 'sk' },
  })

  const READ_MODEL_TABLE_NAME = new Config.Parameter(
    stack,
    'READ_MODEL_TABLE_NAME',
    {
      value: table.tableName,
    }
  )

  return {
    table,
    READ_MODEL_TABLE_NAME,
  }
}
