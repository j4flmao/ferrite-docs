---
title: Messaging (NATS & Kafka)
description: Publish and consume messages with NATS and Kafka handlers that share the module model.
---

# Messaging (NATS & Kafka)

Ferrite treats message brokers as first-class modules. Both **NATS** and **Kafka** follow the same pattern: a handler trait describing a `PATTERN` (subject or topic), a `submit_*_handler!` registry, and a server that starts on bootstrap.

## NATS

```cargo
fr add nats
```

```rust
#[module(imports = [NatsModuleImpl])]
pub struct AppModule;
```

### Handlers

```rust
use ferrite_nats::{MessageHandler, NatsMessage, submit_nats_handler};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OrderPlaced { pub order_id: i64 }

pub struct OrderNotifier;

#[ferrite_framework::async_trait]
impl MessageHandler for OrderNotifier {
    const PATTERN: &'static str = "orders.placed";

    async fn handle(&self, msg: NatsMessage<OrderPlaced>) {
        let OrderPlaced { order_id } = msg.payload;
        notify(order_id).await;
    }
}

submit_nats_handler!(OrderNotifier);
```

`NatsMessage<P>` wraps the typed payload. The server dispatches by pattern (subject) to the matching handler.

### Publishing

```rust
use ferrite_nats::NatsServer;

#[injectable]
pub struct OrdersService {
    nats: NatsServer,
}

impl OrdersService {
    #[inject]
    pub fn new(nats: NatsServer) -> Self {
        Self { nats }
    }

    pub async fn placed(&self, order_id: i64) -> Result<(), NatsError> {
        self.nats.publish("orders.placed", None, &OrderPlaced { order_id }).await
    }
}
```

| `NatsServer` method | Purpose |
| --- | --- |
| `publish(subject, reply, payload)` | Raw payload publish |
| `publish<M>(subject, reply, &message)` | Typed payload publish |
| `subscribe(subject)` | Return a subscription |
| `dispatch(msg)` | Route one message to handlers |
| `run()` | Consume the loop (started for you) |
| `patterns()` | Registered subjects |

## Kafka

```cargo
fr add kafka
```

```rust
#[module(imports = [KafkaModuleImpl])]
pub struct AppModule;
```

### Handlers

```rust
use ferrite_kafka::{KafkaHandler, KafkaMessage, submit_kafka_handler};

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct OrderShipped { pub order_id: i64, pub tracking: String }

pub struct ShipmentHandler;

#[ferrite_framework::async_trait]
impl KafkaHandler for ShipmentHandler {
    const PATTERN: &'static str = "orders.shipped";

    async fn handle(&self, msg: KafkaMessage<OrderShipped>) {
        // msg.payload: OrderShipped
    }
}

submit_kafka_handler!(ShipmentHandler);
```

### Producing & consuming

| `KafkaServer` method | Purpose |
| --- | --- |
| `produce(topic, key, payload)` | Raw producer |
| `produce<M>(topic, key, &message)` | Typed producer |
| `consume_batch(topic, limit)` | Pull `Vec<RawMessage>` |
| `dispatch_one(msg)` | Route a message to handlers |
| `tick()` | Poll once |
| `run()` | Consume loop |
| `patterns()` | Registered topics |

## Lifecycle

Both `NatsModuleImpl` and `KafkaModuleImpl` implement `OnApplicationBootstrap`, and both spawn their consume loops as `tokio` tasks during bootstrap. You never call `run()` yourself.

## Producing from HTTP handlers

```rust
#[controller("/orders")]
pub struct OrdersController { orders: OrdersService }

#[impl_controller]
impl OrdersController {
    #[inject]
    pub fn new(orders: OrdersService) -> Self { Self { orders } }

    #[post("/")]
    pub async fn create(&self, Json(dto): Json<CreateOrderDto>) -> Result<Json<()>, HttpError> {
        self.orders.placed(dto.order_id).await.map_err(HttpError::internal)?;
        Ok(Json(()))
    }
}
```

## Next steps

- [Background jobs](/docs/techniques/background-jobs).
- [CQRS](/docs/techniques/cqrs).