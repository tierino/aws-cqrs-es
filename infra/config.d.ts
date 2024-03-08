import 'sst/node/config'

declare module 'sst/node/config' {
  export interface ConfigTypes {
    APP: string
    STAGE: string
    EVENT_STORE_TABLE_NAME: string
    CUSTOMER_COMMAND_API_URL: string
  }
}
