import 'sst/node/config'

declare module 'sst/node/config' {
  export interface ConfigTypes {
    APP: string
    STAGE: string
    CUSTOMER_COMMAND_API_URL: string
    EVENT_TOPIC_ARN: string
    READ_MODEL_TABLE_NAME: string
  }
}
