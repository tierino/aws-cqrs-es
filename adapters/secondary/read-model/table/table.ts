import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { Table } from 'dynamodb-toolbox'
import { Config } from 'sst/node/config'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

export const ReadModel = new Table({
  name: Config.READ_MODEL_TABLE_NAME,
  partitionKey: 'pk',
  sortKey: 'sk',
  attributes: {
    pk: 'string',
    sk: 'string',
  },
  DocumentClient: DynamoDBDocumentClient.from(new DynamoDBClient()),
})
