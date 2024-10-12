export const SharedEventType = {
  // Shared Event (on server)
  SERVER_EVENT_HANDLER: `repix:events:shared:server:eventHandler`,
  SERVER_CALLBACK_RECEIVER: `repix:events:shared:server:sendCallbackValues`,

  // Shared Event (on client)
  CLIENT_EVENT_HANDLER: `repix:events:shared:client:eventHandler`,
  CLIENT_CALLBACK_RECEIVER: `repix:events:shared:client:sendCallbackValues`,

  // Local Event
  EVENT_HANDLER: `repix:events:local:eventHandler`,
} as const
