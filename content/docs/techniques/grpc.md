---
title: gRPC
description: Expose gRPC services on the same module model with ferrite-grpc.
---

# gRPC

`ferrite-grpc` brings tonic-based gRPC to the Ferrite module model. A service is a provider you register, and the gRPC server starts automatically during bootstrap.

## Enable it

```cargo
fr add grpc
```

```rust
#[module(imports = [GrpcModuleImpl])]
pub struct AppModule;
```

## Start it

`GrpcModuleImpl` implements `OnApplicationBootstrap`, so the server starts when the app is ready. Configure the address at startup:

```rust
#[bootstrap]
async fn main() {
    let app = Ferrite::create::<AppModule>().await;

    let grpc: Arc<GrpcServer> = app.container.get::<GrpcServer>();
    tokio::spawn(async move {
        grpc.start("0.0.0.0:50051").await.expect("grpc server failed");
    });

    app.listen("0.0.0.0:3000").await?;
}
```

## Registering services

Generated tonic services expose a wrapper constructor `new(impl Services)`. Register them with `submit_grpc_service!`:

```rust
use ferrite_grpc::submit_grpc_service;

// Simple form: type implements components needed + Default-compatible
submit_grpc_service!(GreeterService);

// Advanced form: (provider type, wrapper type) — the server downcasts the
// provider from the container and builds the tonic wrapper:
submit_grpc_service!(GreeterService, GreeterServerWrapper);
```

The second form produces:

```rust
let typed: Arc<GreeterService> = container.try_get_any(type_id)?.downcast().ok();
srv.add_service(<GreeterServerWrapper>::new((*typed).clone()));
```

### Manual registration

```rust
let grpc: Arc<GrpcServer> = container.get::<GrpcServer>();
grpc.add_service(GreeterServer::new(my_impl));
grpc.service_names()   // inspect registered names
```

## `GrpcServer`

| Method | Purpose |
| --- | --- |
| `add_service<T>(&self, service: T)` | Register a generated service |
| `build_server() -> Router` | Assemble the tonic router from inventory |
| `start<A: ToSocketAddrs>(&self, addr)` | Bind and serve |
| `service_names() -> Vec<String>` | Registered service names |

The inventory-driven `build_server` walks every `submit_grpc_service!` registration, resolving each service from the container. A `PlaceholderService` is always added so the router is never empty (it responds with `grpc-status: 12`, `NOT_IMPLEMENTED`).

## Protobuf & codegen

`ferrite-grpc` is wired to `tonic` / `prost`:

```toml
tonic = { version = "0.13", features = ["prost", "transport", "router", "server"] }
prost = "0.14"
prost-types = "0.14"
```

Generate stubs from `.proto` files with `tonic-build` as usual, then register the generated types.

## Health & timeouts

| Env | Default |
| --- | --- |
| `GRPC_HEALTH_TIMEOUT_MS` | `30000` |

Errors: `GrpcError::{Transport(String), AlreadyExists(String), InvalidAddress(String)}`, with a `From<tonic::transport::Error>` conversion.

## Example

The microservices examples (`micro-gateway`, `micro-sqlx-users`, etc.) show a gRPC fleet talking through an HTTP gateway.

## Next steps

- [Messaging (NATS & Kafka)](/docs/techniques/messaging).
- [WebSockets](/docs/techniques/websockets).