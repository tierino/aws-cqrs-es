export class ProjectionError extends Error {
  constructor(eventName: string, message: string) {
    super(`Failed to update projection for "${eventName}" event. ${message}`)
  }
}
