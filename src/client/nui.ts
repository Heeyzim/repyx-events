'use strict'

export class NUIEvent {
  /**
   * @description
   * Add a listener for NUI callback events.
   */
  listen = (
    name: string,
    handler: (data: any, callback: (data: Record<string, any>) => void) => any,
  ) => {
    name = encodeURIComponent(name)

    RegisterNuiCallbackType(name)
    on(`__cfx_nui:${name}`, handler)
  }

  /**
   * @description
   * Trigger NUI event
   */
  emit = (name: string, data: any = {}) => {
    SendNuiMessage(
      JSON.stringify({
        name,
        data,
      }),
    )
  }
}
