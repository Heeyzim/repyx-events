'use strict'

type Listeners = {
  id: number
  name: string
  handler: (...args: any) => Promise<any> | any
}

export type CallbackValueData = {
  uniqueId: string
  values: any
}

export type EmitData = {
  name: string
  uniqueId: string
  args: any[]
}

export class EventBase {
  protected $listenerCounter = 1
  protected $listeners: Listeners[] = []
  protected $callbackValues: CallbackValueData[] = []

  protected $validateEventName = (name: string | string[]) => {
    // Check if the name is an array or string
    if (
      (typeof name === 'object' && Array.isArray(name)) ||
      typeof name !== 'string'
    ) {
      throw new Error(`Invalid Event Name Properties for ${name}`)
    }

    // If the name was a string then convert it to an array
    if (typeof name === 'string') {
      name = [name]
    }

    // Check if the name is an array of strings
    if (name.find((alias) => typeof alias !== 'string')) {
      throw new Error(`Invalid Event Name Properties for ${name}`)
    }

    return name
  }
}
