---
title: Lifecycle events
description: Hook into application startup and shutdown with lifecycle traits.
---

# Lifecycle events

Ferrite exposes four lifecycle hooks. Each is an `#[async_trait]` with default no-op implementations, so you only override what you need.

## The hooks

| Hook | Runs when | Typical use |
| --- | --- | --- |
| `OnModuleInit` | A module's providers are instantiated | Open clients, warm caches, validate config |
| `OnApplicationBootstrap` | The full graph is assembled, right before the server starts accepting | Start background servers (gRPC, message consumers) |
| `OnModuleDestroy` | Application shutdown begins | Close resources, flush buffers |
| `OnApplicationShutdown` | Shutdown after modules are destroyed | Final teardown |

## Usage

```rust
use ferrite_framework::{OnApplicationBootstrap, OnModuleInit, async_trait, injectable};

#[injectable]
pub struct MetricsService;

impl MetricsService {
    #[inject]
    pub fn new() -> Self {
        Self
    }
}

#[async_trait]
impl OnModuleInit for MetricsService {
    async fn on_module_init(&self) {
        // e.g. pre-create a connection pool
    }
}

#[async_trait]
impl OnApplicationBootstrap for MetricsService {
    async fn on_application_bootstrap(&self) {
        // e.g. start the metrics exporter
    }
}
```

## Hooking a module

Ecosystem modules implement these hooks internally. For example, `ferrite-grpc`'s `GrpcModuleImpl` implements `OnApplicationBootstrap` so the gRPC server starts when the app is ready:

```rust
#[module(imports = [GrpcModuleImpl])]
pub struct AppModule;

// GrpcModuleImpl::on_application_bootstrap() spawns:
//   grpc.start("0.0.0.0:50051")
```

The same pattern applies to `NatsModuleImpl`, `KafkaModuleImpl`, `QueueModuleImpl`, `CronModuleImpl`, and `I18nModuleImpl`.

## Shutdown ordering

Shutdown happens in the reverse order of startup: application hooks first, then module destroy hooks. Keep expensive cleanup in `OnModuleDestroy` (pools, queues) and one-time teardown in `OnApplicationShutdown`.

## Threading & async

All hooks are async — spawning backend loops inside `OnApplicationBootstrap` with `tokio::spawn` is the documented pattern for gRPC, NATS, and Kafka servers. Errors inside hooks propagate through bootstrap as usual (you'll see them via the app's error/panic path).

## Next steps

- [Bootstrap](/docs/overview/bootstrap).
- [Testing](/docs/fundamentals/testing).