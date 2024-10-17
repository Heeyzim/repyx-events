import { SharedEvent } from '@server/shared'
import { LocalEvent } from '@shared/local-event'

export class ServerEvents {
  protected timeout: number
  server: LocalEvent
  shared: SharedEvent

  constructor(timeout: number = 5000) {
    this.timeout = timeout
    this.server = new LocalEvent(this.timeout)
    this.shared = new SharedEvent(this.timeout)
  }
}
