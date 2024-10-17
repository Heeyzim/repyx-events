import { NUIEvent } from '@client/nui'
import { SharedEvent } from '@client/shared'
import { LocalEvent } from '@shared/local-event'

export class ClientEvents {
  protected timeout: number
  nui: NUIEvent
  client: LocalEvent
  shared: SharedEvent

  constructor(timeout: number = 5000) {
    this.timeout = timeout
    this.nui = new NUIEvent()
    this.client = new LocalEvent(this.timeout)
    this.shared = new SharedEvent(this.timeout)
  }
}
