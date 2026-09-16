---
title: WebSockets
description: Build realtime features with WebSocket gateways, rooms and a shared WsServer.
---

# WebSockets

`ferrite-ws` adds WebSocket support with a **gateway** model — the same shape as NestJS's `@WebSocketGateway`. Gateways are providers that declare a path, handle connections and messages, and get access to a server with rooms and broadcasting.

## Enable it

```cargo
fr add ws
```

```rust
#[module(imports = [WsModuleImpl])]
pub struct AppModule;

// in main.rs, mount onto the router:
let app = Ferrite::create::<AppModule>().await;
ferrite_ws::mount_on(&mut app.router, app.container.clone(), "/ws");
app.listen("0.0.0.0:3000").await?;
```

The mount prefix plus each gateway's path forms the socket URL, e.g. `ws://localhost:3000/ws/chat`.

## A gateway

```rust
use ferrite_ws::{Gateway, WsContext, WsError, OutgoingMessage, submit_gateway};
use ferrite_framework::{injectable, inject};
use serde_json::json;
use std::sync::Arc;

#[injectable]
pub struct ChatGateway {
    messages: MessagesService,
}

impl ChatGateway {
    #[inject]
    pub fn new(messages: MessagesService) -> Self {
        Self { messages }
    }
}

#[ferrite_framework::async_trait]
impl Gateway for ChatGateway {
    fn path() -> &'static str {
        "/ws/chat"
    }

    async fn handle_connection(&self, ctx: Arc<WsContext>) -> Result<(), WsError> {
        let _ = ctx.emit(OutgoingMessage::event("chat:hello", json!({"msg": "welcome"})));
        Ok(())
    }

    async fn handle_message(
        &self,
        ctx: Arc<WsContext>,
        event: &str,
        data: serde_json::Value,
    ) -> Result<Option<OutgoingMessage>, WsError> {
        match event {
            "chat:send" => {
                let id = ctx.id;
                let msg = OutgoingMessage::event("chat:broadcast", json!({"from": id, "data": data}));
                ctx.broadcast(msg.clone()).await;
                Ok(Some(msg))
            }
            _ => Ok(None),
        }
    }

    async fn handle_disconnect(&self, ctx: Arc<WsContext>) {
        let _ = ctx.broadcast(OutgoingMessage::event("chat:left", json!({"id": ctx.id})));
    }
}

submit_gateway!(ChatGateway, "/ws/chat");
```

### The `Gateway` trait

| Method | Default | Called |
| --- | --- | --- |
| `path() -> &'static str` | `"/ws"` | registration |
| `handle_connection(&self, ctx: Arc<WsContext>)` | no-op | on connect |
| `handle_message(&self, ctx, event, data)` | no-op | per inbound message |
| `handle_disconnect(&self, ctx)` | no-op | on disconnect |

`submit_gateway!(Type, "/path")` registers the gateway into the inventory so `mount_on` can find it.

## Wire format

Messages are JSON envelopes with an optional `event`:

```json
{ "event": "chat:broadcast", "data": { "from": "...", "text": "hi" } }
```

```rust
IncomingMessage { event: String, data: Value }
OutgoingMessage::event("chat:history", json!(...))
OutgoingMessage::from(value)          // event-less
OutgoingMessage::from("plain string")
```

## `WsContext`

Per-connection context:

```rust
ctx.id            // SocketId (Uuid)
ctx.path          // connected path
ctx.query         // query string
ctx.server()      // handle to the WsServer

ctx.emit(msg).await;        // send to this socket
ctx.broadcast(msg).await;   // send to all sockets
```

## `WsServer` — rooms & broadcast

The global singleton server:

| Method | Purpose |
| --- | --- |
| `count() -> usize` | Connected sockets |
| `send_to(id, msg)` | Direct message |
| `broadcast(msg)` | All sockets |
| `emit_to_room(room, msg)` | One room |
| `join_room(id, room)` / `leave_room(id, room)` | Room membership |

```rust
server.join_room(ctx.id, "general");
server.emit_to_room("general", OutgoingMessage::event("room:update", json!({"n": 2})));
```

## Errors

`WsError` covers `Protocol(String)`, `Json(serde_json::Error)`, `Closed`, and `Gateway(String)`, with a `From<axum::Error>` conversion.

## Example

The repo ships a full `mono-ws-chat` example (port 3003) with a chat gateway, history, rooms, and an e2e test.

## Next steps

- [gRPC](/docs/techniques/grpc).
- [Messaging](/docs/techniques/messaging).