'use strict'
import { ISharedEvent, SharedEvent } from '@server/shared'
import { ILocalEvent, LocalEvent } from '@shared/local'

export interface IEventsServer {
  server: ILocalEvent
  shared: ISharedEvent
}

export class Events {
  server: LocalEvent = new LocalEvent()
  shared: SharedEvent = new SharedEvent()
}
