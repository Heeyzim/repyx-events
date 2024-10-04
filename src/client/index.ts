import { NUIEvent } from '@client/nui'
import { SharedEvent } from '@client/shared'
import { LocalEvent } from '@shared/local'

export class ClientEvents {
  nui = new NUIEvent()
  client = new LocalEvent()
  shared = new SharedEvent()
}
