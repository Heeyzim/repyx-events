import { CallbackValueData, EventBase } from '@shared/event-base'
import { EmitData, NotifyEmitData } from '@shared/local-event'
import { SharedEventType } from '@shared/shared-event-type'
import { generateUniqueId, isPromise } from '@shared/utils'

export class SharedEvent extends EventBase {
  constructor(private timeout: number) {
    super()

    onNet(SharedEventType.CLIENT_EVENT_HANDLER, async (props: EmitData) => {
      const listeners = this.$listeners.get(props.name) || []

      for (const listener of listeners) {
        let value = listener.handler(...props.args)

        if (isPromise(value)) {
          value = await value

          const callbackData: CallbackValueData = {
            uniqueId: props.uniqueId,
            value,
          }
          emitNet(SharedEventType.SERVER_CALLBACK_RECEIVER, callbackData)
        }
      }
    })

    onNet(
      SharedEventType.CLIENT_EVENT_HANDLER_NOTIFY,
      async (props: NotifyEmitData) => {
        const listeners = this.$listeners.get(props.name) || []

        for (const listener of listeners) {
          let value = listener.handler(...props.args)

          if (isPromise(value)) {
            value = await value
          }
        }
      },
    )

    onNet(
      SharedEventType.CLIENT_CALLBACK_RECEIVER,
      (data: CallbackValueData) => {
        this.$callbackValues.set(data.uniqueId, data.value)
      },
    )
  }

  emit = (name: string, ...args: any[]) => {
    name = this.$validateEventName(name)
    const uniqueId = generateUniqueId()

    const emitData: EmitData = {
      args,
      name,
      uniqueId,
    }

    emitNet(SharedEventType.SERVER_EVENT_HANDLER, emitData)

    return new Promise((resolve, reject) => {
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

  notify = (name: string, ...args: any[]): void => {
    name = this.$validateEventName(name)

    const emitData: NotifyEmitData = {
      args,
      name,
    }

    emitNet(SharedEventType.SERVER_EVENT_HANDLER_NOTIFY, emitData)
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
