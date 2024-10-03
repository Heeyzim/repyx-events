'use strict'
import { EmitData, EventBase } from '@shared/base'
import { SharedEventType } from '@shared/type'

export interface ILocalEvent extends EventBase {
  emit: (name: string | string[], ...args: any[]) => Promise<any>
  listen: (name: string | string[], handler: (...args: any) => any) => number[]
}

export class LocalEvent extends EventBase implements ILocalEvent {
  #isPromise = (fn: any): boolean => {
    if (fn instanceof Promise) return true
    return false
  }

  constructor() {
    super()

    on(SharedEventType.EVENT_HANDLER, async (props: EmitData) => {
      const listeners = this.$listeners.filter(
        (listener) => listener.name === props.name,
      )

      for (const listener of listeners) {
        let value = listener.handler(props.args)

        if (this.#isPromise(value)) {
          value = await value
        }

        this.$callbackValues.push({
          uniqueId: props.uniqueId,
          values: value ?? null,
        })
      }
    })
  }

  /**
   * @description
   * Emit an event locally (Client to Client or Server to Server)
   */
  emit = async (name: string | string[], ...args: any[]) => {
    name = this.$validateEventName(name)
    const uniqueId = Math.random().toString(36).substring(2)

    for (const alias of name) {
      const emitData: EmitData = {
        name: alias,
        uniqueId,
        args,
      }

      emit(SharedEventType.EVENT_HANDLER, emitData)
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
   * Listen from a local event
   */
  listen = (name: string | string[], handler: (...args: any) => any) => {
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
