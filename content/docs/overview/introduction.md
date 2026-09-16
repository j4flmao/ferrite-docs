---
title: Introduction
description: Learn what Ferrite is, the problems it solves, and the core ideas behind the framework.
---

# Introduction

Ferrite is a batteries-included backend framework for Rust. It borrows the most productive ideas from Node's NestJS ecosystem and brings them to Rust with a twist: because Rust has no runtime reflection, Ferrite resolves your whole dependency graph at **compile time**. If a provider is missing or a cycle exists, you get a compiler error — not a runtime panic.

At its core Ferrite offers **modules**, **providers**, **controllers**, and **cross-cutting concerns** (guards, interceptors, middleware, and pipes), all expressed with a small set of attribute macros on top of **Axum**, **Tokio**, and **Tower**.

## How Ferrite is different

```text
NestJS (TypeScript):         Ferrite (Rust):
- runtime DI container       - compile-time dependency graph
- decorators + reflection    - attribute macros + inventory registry
- request/response pipeline  - explicit Middleware/Guard/Interceptor/Pipe pipeline
- one process, one server    - single static binary, tiny footprint
```

The *shape* of an application is nearly identical, which makes Ferrite instantly familiar to anyone coming from NestJS — but the guarantees are stronger and the runtime cost is lower.

## A minimal application

```rust
use ferrite_framework::{bootstrap, controller, impl_controller, injectable, module, Ferrite};

#[injectable]
pub struct AppService;

impl AppService {
    #[inject]
    pub fn new() -> Self {
        Self
    }

    pub fn hello(&self) -> String {
        "Ferrite is running".to_string()
    }
}

#[controller("/health")]
pub struct HealthController {
    service: AppService,
}

#[impl_controller]
impl HealthController {
    #[inject]
    pub fn new(service: AppService) -> Self {
        Self { service }
    }

    #[get("/")]
    pub async fn health(&self) -> String {
        self.service.hello()
    }
}

#[module(controllers = [HealthController], providers = [AppService])]
pub struct AppModule;

#[bootstrap]
async fn main() {
    let app = Ferrite::create::<AppModule>().await;
    app.listen("0.0.0.0:3000").await.expect("failed to bind 0.0.0.0:3000");
}
```

## Design principles

**1. Everything is a provider.** Services, controllers, repositories, and infrastructure singletons are all registered with the DI container and resolved by type. There is no shared `app` object to reach into.

**2. The graph is known at compile time.** The `#[module]`, `#[injectable]`, and `#[inject]` macros emit registration metadata at compile time via the [`inventory`](https://crates.io/crates/inventory) and `linkme` registries, which the bootstrap step assembles into the running `Container`.

**3. The pipeline is explicit and ordered.** Requests flow through `Middleware → Guards → Interceptors(before) → Pipes → Handler → Interceptors(after)`, with exception filters catching errors along the way. You control exactly which stages a route participates in.

**4. Single static binary.** No runtime, no VM, no dynamic loading. `fr build --release` produces a self-contained executable you can drop on any server.

**5. One CLI for everything.** The `fr` binary scaffolds projects, generates artifacts, manages ecosystem crates, runs a hot-reloading dev server, drives database migrations, and exports OpenAPI specs.

## What ships with the framework

| Area | Crate | Status |
| --- | --- | --- |
| Kernel & DI | `fr-core` / `ferrite-framework` | Stable |
| HTTP transport | `ferrite-http` | Stable |
| Configuration | `fr-config` | Stable |
| Validation | `ferrite-validation` | Stable |
| ORM abstraction | `ferrite-orm` + adapters | Stable (in-memory + Sea adapters) |
| Health checks | `ferrite-health` | Stable |
| JWT auth | `ferrite-auth-jwt` | Stable |
| OAuth2 / OIDC | `ferrite-auth-oauth` | Stable |
| OpenAPI / Swagger | `ferrite-swagger` | Stable |
| WebSockets | `ferrite-ws` | Stable |
| Caching | `ferrite-cache-redis` | Stable |
| Rate limiting | `ferrite-throttler` | Stable |
| Testing | `ferrite-testing` | Stable |
| gRPC | `ferrite-grpc` | Stable |
| Messaging | `ferrite-nats` / `ferrite-kafka` | Stable |
| Jobs & schedule | `ferrite-queue` / `ferrite-cron` | Stable |
| CQRS / i18n | `ferrite-cqrs` / `ferrite-i18n` | Stable |

## Where to go next

- [First steps](/docs/overview/first-steps) — scaffold your first service with `fr new`.
- [Controllers](/docs/overview/controllers) — handle HTTP requests.
- [Providers](/docs/overview/providers) — services and dependency injection.
- [Modules](/docs/overview/modules) — structure your application.