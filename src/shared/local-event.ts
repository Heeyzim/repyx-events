import { SharedEventType } from '@shared/shared-event-type'
import { generateUniqueId, isPromise } from '@shared/utils'

import { CallbackValueData, EventBase } from '@shared/event-base'

export type EmitData = {
  name: string
  uniqueId: string
  args: any[]
}

export type NotifyEmitData = {
  name: string
  args: any[]
}

export class LocalEvent extends EventBase {
  constructor(private timeout: number) {
    super()

    on(SharedEventType.EVENT_HANDLER, async (props: EmitData) => {
      const listeners = this.$listeners.get(props.name) || []
      listeners.forEach(async (listener) => {
        let value = listener.handler(...props.args)

        if (isPromise(value)) {
          value = await value
        }

        emit(SharedEventType.EVENT_HANDLER_CALLBACK, {
          uniqueId: props.uniqueId,
          value,
        })
      })
    })

    on(SharedEventType.EVENT_HANDLER_NOTIFY, async (props: EmitData) => {
      const listeners = this.$listeners.get(props.name) || []
      listeners.forEach(async (listener) => {
        let value = listener.handler(...props.args)

        if (isPromise(value)) {
          value = await value
        }
      })
    })

    on(SharedEventType.EVENT_HANDLER_CALLBACK, (props: CallbackValueData) => {
      this.$callbackValues.set(props.uniqueId, props.value)
    })
  }

  emit = async <T = any>(name: string, ...args: any[]): Promise<T> => {
    name = this.$validateEventName(name)
    const uniqueId = generateUniqueId()

    const emitData: EmitData = {
      args,
      name,
      uniqueId,
    }

    emit(SharedEventType.EVENT_HANDLER, emitData)

    return new Promise<T>((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error(`Callback Timeout ${this.timeout}ms`)),
        this.timeout,
      )

      const checkCallback = () => {
        if (this.$callbackValues.has(uniqueId)) {
          clearTimeout(timeout)
          const returnValue = this.$callbackValues.get(uniqueId)
          this.$callbackValues.delete(uniqueId)
          resolve(returnValue)
        } else {
          setTimeout(checkCallback, 50)
        }
      }

      checkCallback()
    })
  }

  notify = (name: string, ...args: any[]) => {
    name = this.$validateEventName(name)

    const emitData: NotifyEmitData = {
      args,
      name,
    }

    emit(SharedEventType.EVENT_HANDLER, emitData)
  }

  listen = (name: string, handler: (...args: any) => any) => {
    const listener = {
      id: this.$listenerCounter,
      name,
      handler,
    }
    if (this.$listeners.has(name)) {
      this.$listeners.get(name)?.push(listener)
    } else {
      this.$listeners.set(name, [listener])
    }
    this.$listenerCounter++

    return listener.id
  }
}
