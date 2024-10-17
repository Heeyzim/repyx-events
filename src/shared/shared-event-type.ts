export const SharedEventType = {
  // Shared Event (on server)
  SERVER_EVENT_HANDLER: `repyx:events:shared:server:eventHandler`,
  SERVER_CALLBACK_RECEIVER: `repyx:events:shared:server:sendCallbackValues`,

  // Shared Event (on client)
  CLIENT_EVENT_HANDLER: `repyx:events:shared:client:eventHandler`,
  CLIENT_CALLBACK_RECEIVER: `repyx:events:shared:client:sendCallbackValues`,

  // Local Event
  EVENT_HANDLER: `repyx:events:local:eventHandler`,
  EVENT_HANDLER_CALLBACK: `repyx:events:local:eventHandler:callback`,
} as const
