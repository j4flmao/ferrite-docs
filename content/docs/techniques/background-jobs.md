---
title: Background jobs
description: Dispatch and process jobs with ferrite-queue, backed by memory or Redis.
---

# Background jobs

`ferrite-queue` gives you a `Queue` abstraction with an in-memory and a Redis implementation, a typed `DispatcherService` to enqueue, and a `WorkerService` to process.

## Enable it

```cargo
fr add queue
```

```rust
#[module(imports = [QueueModuleImpl])]
pub struct AppModule;
```

## Job types

A job is any serializable, cloneable type:

```rust
pub trait Job: Serialize + for<'de> Deserialize<'de> + Clone + Send + Sync + 'static {}
```

```rust
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct EmailJob {
    pub to: String,
    pub subject: String,
    pub body: String,
}
```

## Dispatch

```rust
use ferrite_queue::{DispatcherService, JobEnvelope};

#[injectable]
pub struct OrdersService {
    dispatcher: DispatcherService<MemoryQueue>,
}

impl OrdersService {
    #[inject]
    pub fn new(dispatcher: DispatcherService<MemoryQueue>) -> Self {
        Self { dispatcher }
    }

    pub async fn send_receipt(&self, email: EmailJob) -> Result<(), JobError> {
        self.dispatcher.dispatch(email).await
        // or: dispatcher.dispatch_to("critical", email)
    }
}
```

`JobEnvelope::new::<J>(&job, queue)` wraps jobs with their target queue when you need explicit routing.

## Workers

```rust
use ferrite_queue::{JobHandler, submit_job_handler};

pub struct EmailWorker;

#[ferrite_framework::async_trait]
impl JobHandler<EmailJob> for EmailWorker {
    async fn handle(&self, job: EmailJob) -> Result<(), JobError> {
        send_email(&job).await?;
        Ok(())
    }
}

submit_job_handler!(EmailWorker);
```

The worker registry maps `TypeId` of the job to its handler. `WorkerService` runs `run()`/`tick()` to drain queues — `QueueModuleImpl` wires this on bootstrap.

## Queues

| Queue | Backing | Use case |
| --- | --- | --- |
| `MemoryQueue` | In-process VecDeque | Tests, single instance, dev |
| `RedisQueue` | Redis list | Multi-instance, durable-ish |

`DispatcherService::new::<Q>(queue, default_queue)` binds a dispatcher to a specific queue implementation.

## Full flow

```text
HTTP handler ──dispatch──▶ Queue ──► WorkerService ──► JobHandler<EmailJob>
```

The dispatcher serializes the job, enqueues it; the worker pops it, deserializes, and calls the matching handler.

## Next steps

- [Scheduling](/docs/techniques/scheduling).
- [CQRS](/docs/techniques/cqrs).