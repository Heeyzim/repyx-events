'use strict'
import { CallbackValueData, EmitData, EventBase } from '@shared/base'
import { SharedEventType } from '@shared/type'

export interface ISharedEvent extends EventBase {
  emit: (
    name: string | string[],
    target: number | 'global',
    ...args: any[]
  ) => Promise<any>
  listen: (
    name: string | string[],
    handler: (source: number, ...args: any) => any,
  ) => any
}

export class SharedEvent extends EventBase implements ISharedEvent {
  #isPromise = (fn: any): boolean => {
    if (fn instanceof Promise) return true
    return false
  }

  constructor() {
    super()

    onNet(SharedEventType.SERVER_EVENT_HANDLER, async (props: EmitData) => {
      const listeners = this.$listeners.filter(
        (listener) => listener.name === props.name,
      )
      const source = globalThis.source

      for (const listener of listeners) {
        let value = listener.handler(source, ...props.args)

        if (this.#isPromise(value)) {
          value = await value
        }

        emitNet(SharedEventType.CLIENT_CALLBACK_RECEIVER, source, {
          uniqueId: props.uniqueId,
          values: value ?? null,
        })
      }
    })

    onNet(
      SharedEventType.SERVER_CALLBACK_RECEIVER,
      (data: CallbackValueData) => {
        this.$callbackValues.push(data)
      },
    )
  }

  /**
   * @description
   * Emit an event from Server to Client
   */
  emit = async (
    name: string | string[],
    target: number | 'global',
    ...args: any[]
  ) => {
    name = this.$validateEventName(name)
    const uniqueId = Math.random().toString(36).substring(2)

    if (target === 'global') {
      target = -1
    }

    for (const alias of name) {
      const emitData: EmitData = {
        name: alias,
        uniqueId,
        args,
      }

      emitNet(SharedEventType.CLIENT_EVENT_HANDLER, target, emitData)
    }

    let callbackValues = this.$callbackValues.findIndex(
      (data) => data.uniqueId === uniqueId,
    )

    while (callbackValues === -1) {
      await new Promise((resolve) => setTimeout(resolve, 50))
      callbackValues = this.$callbackValues.findIndex(
        (data) => data.uniqueId === uniqueId,
      )
    }

    const returnValue = this.$callbackValues[callbackValues].values

    // Remove the callback values from the array
    this.$callbackValues.splice(callbackValues, 1)

    return returnValue
  }

  /**
   * @description
   * Listen from a Client event
   */
  listen = (
    name: string | string[],
    handler: (source: number, ...args: any) => any,
  ) => {
    name = this.$validateEventName(name)
    const ids: number[] = []

    for (const alias of name) {
      this.$listeners.push({
        id: this.$listenerCounter,
        name: alias,
        handler,
      })

      ids.push(this.$listenerCounter)

      this.$listenerCounter++
    }

    return ids
  }
}
