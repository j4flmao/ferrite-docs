---
title: CQRS
description: Split commands and queries with CommandBus, Inbox/Outbox, and QueryDB helpers.
---

# CQRS

`ferrite-cqrs` provides a command/event split for the write side plus an outbox mechanism for durably emitting domain events.

## Enable it

```cargo
fr add cqrs
```

```rust
#[module(imports = [CqrsModule])]
pub struct AppModule;
```

## Commands

Commands are plain serializable types:

```rust
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct CreateNote {
    pub author_id: i64,
    pub body: String,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct NoteCreated {
    pub note_id: i64,
    pub author_id: i64,
}
```

## CommandBus

`CommandBus` dispatches a command and returns the aggregate result type. Handlers are registered per command type:

```rust
use ferrite_cqrs::{CommandBus, CommandHandler, register_command_handler};

pub struct CreateNoteHandler(Arc<Repository<Note>>);
#[async_trait]
impl CommandHandler<CreateNote, CreateNote> for CreateNoteHandler {
    async fn handle(&self, cmd: CreateNote) -> Result<CreateNote, CqrsError> {
        // returns a command-specific result
        Ok(CreateNote { /* ... */ })
    }
}
register_command_handler!(CreateNoteHandler, CreateNote, CreateNote);
```

Dispatch from any provider:

```rust
#[injectable]
pub struct NotesService {
    bus: CommandBus,
}

impl NotesService {
    #[inject]
    pub fn new(bus: CommandBus) -> Self {
        Self { bus }
    }

    pub async fn create(&self, author_id: i64, body: String) -> Result<CreateNote, CqrsError> {
        self.bus.execute(CreateNote { author_id, body }).await
    }
}
```

## Inbox / Outbox

The outbox pattern persists outgoing events so they can be delivered at-least-once:

```rust
use ferrite_cqrs::Outbox;
```

| Method | Purpose |
| --- | --- |
| `publish(event)` | Append a serialized event to the outbox |
| `dispatch()` | Drain published events through the message handlers |
| `fetch_active()` | Read pending events |

The inbox side tracks processed events with an `Inbox` keyed by `(message_id, payload)` so replays are idempotent.

## QueryDB

For the query side, `QueryDB` is a thin wrapper over a relaxed-access repository layer (in-memory by default) built from plain structs:

```rust
use ferrite_cqrs::QueryDB;

#[derive(Clone, serde::Serialize, serde::Deserialize)]
pub struct NoteView { pub id: i64, pub body: String }

db.upsert(NoteView { id, body });
let view = db.get::<NoteView>(id);
let all = db.all::<NoteView>();
```

Swap the storage engine by replacing the store in the container for read models.

## How they fit

```text
Controller ──CommandBus──▶ Handler(lookup/store) ──► Outbox.publish(NoteCreated)
                                                        │
Over night scans/other loops ──Outbox.dispatch──▶ event handlers
```

The write path is authoritative; the outbox makes events durable; QueryDB keeps reads cheap.

## Next steps

- [Messaging](/docs/techniques/messaging) once events cross service boundaries.
- [Database (ORM)](/docs/techniques/database).