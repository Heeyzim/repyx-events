import { CallbackValueData, EventBase } from '@shared/event-base'
import { EmitData, NotifyEmitData } from '@shared/local-event'
import { SharedEventType } from '@shared/shared-event-type'
import { generateUniqueId, isPromise } from '@shared/utils'

export class SharedEvent extends EventBase {
  constructor(private timeout: number) {
    super()

    onNet(SharedEventType.SERVER_EVENT_HANDLER, async (props: EmitData) => {
      const listeners = this.$listeners.get(props.name) || []

      const source = globalThis.source

      for (const listener of listeners) {
        let value = listener.handler(...props.args)

        if (isPromise(value)) {
          value = await value
        }

        const emitData: CallbackValueData = {
          uniqueId: props.uniqueId,
          value,
        }
        emitNet(SharedEventType.CLIENT_CALLBACK_RECEIVER, source, emitData)
      }
    })

    onNet(
      SharedEventType.SERVER_EVENT_HANDLER_NOTIFY,
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
      SharedEventType.SERVER_CALLBACK_RECEIVER,
      (data: CallbackValueData) => {
        this.$callbackValues.set(data.uniqueId, data.value)
      },
    )
  }

  emit = async <T = any>(
    name: string,
    target: number | 'global',
    ...args: any[]
  ): Promise<T> => {
    name = this.$validateEventName(name)
    const uniqueId = generateUniqueId()

    if (target === 'global') target = -1

    const emitData: EmitData = {
      args,
      name,
      uniqueId,
    }

    emitNet(SharedEventType.CLIENT_EVENT_HANDLER, target, emitData)

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

  notify = async (name: string, target: number | 'global', ...args: any[]) => {
    name = this.$validateEventName(name)

    if (target === 'global') target = -1

    const emitData: NotifyEmitData = {
      args,
      name,
    }

    emitNet(SharedEventType.CLIENT_EVENT_HANDLER_NOTIFY, target, emitData)
  }

  listen = (
    name: string | string[],
    handler: (source: number, ...args: any) => any,
  ) => {
    name = this.$validateEventName(name)

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
