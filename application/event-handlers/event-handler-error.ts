export class EventHandlerError extends Error {
  constructor(eventName: string, message: string) {
    super(`Failed to handle "${eventName}" event. ${message}`)
  }
}
