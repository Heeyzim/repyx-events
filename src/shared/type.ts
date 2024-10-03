export const SharedEventType = {
  // Shared Event (on server)
  SERVER_EVENT_HANDLER: `${GetCurrentResourceName()}:events:shared:server:eventHandler`,
  SERVER_CALLBACK_RECEIVER: `${GetCurrentResourceName()}:events:shared:server:sendCallbackValues`,

  // Shared Event (on client)
  CLIENT_EVENT_HANDLER: `${GetCurrentResourceName()}:events:shared:client:eventHandler`,
  CLIENT_CALLBACK_RECEIVER: `${GetCurrentResourceName()}:events:shared:client:sendCallbackValues`,

  // Local Event
  EVENT_HANDLER: `${GetCurrentResourceName()}:events:local:eventHandler`,
} as const
