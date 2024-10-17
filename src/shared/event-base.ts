export type Listeners = {
  id: number
  name: string
  handler: (...args: any) => Promise<any> | any
}

export type CallbackValueData = {
  uniqueId: string
  value: any
}

export class EventBase {
  protected $listenerCounter = 1
  protected $listeners: Map<string, Listeners[]> = new Map()
  protected $callbackValues: Map<string, any> = new Map()

  protected $validateEventName = (name: string | string[]) => {
    if (typeof name !== 'string') {
      throw new Error(`Invalid Event Name Properties for ${name}`)
    }

    return name
  }
}
