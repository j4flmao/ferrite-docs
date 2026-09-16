---
title: Crates
description: The Ferrite workspace at a glance — every first-party crate, its role, and its status.
---

# Crates

Ferrite is a Cargo workspace of focused crates. All first-party crates are pinned to `=0.1.0` and shipped under the MIT license. Here's the full map, from core to ecosystem.

## Core framework

| Crate | Role | Status |
| --- | --- | --- |
| `ferrite-dashboard` | Development dashboard | Stub — minimal placeholder output |
| `ferrite-extras` | Small utilities/helpers | Scaffold |
| `ferrite-framework` | Umbrella crate re-exporting runtime + macros | **Works** |
| `ferrite-macros` | proc-macros (`#[module]`, `#[injectable]`, `#[inject]`, `#[controller]`, `#[impl_controller]`, route + guard/interceptor attrs) | **Works** |
| `ferrite-runtime` | Runtime: routing layers, guards/interceptors, request context, panics, WebSocket wiring types | **Works** |
| `ferrite-orm` | Entity + `Repository<E>` + in-memory store | **Works** |
| `ferrite-spec` | Shared trait/type definitions & LTS contract (`FERRITE_LTS_MACRO_SURFACE_VERSION`) | **Works** |
| `ferrite-swagger` | OpenAPI 3.1 generation + Swagger UI routes | **Works** |
| `ferrite-testing` | `TestingModule` harness | **Works** |
| `ferrite-cli` / `fr-cli` | The `fr` binary | **Works** |

## Ecosystem

| Crate | Role | Status |
| --- | --- | --- |
| `ferrite-auth-jwt` | HS256 JWT service, `AuthGuard`, `CurrentUser` | **Works** |
| `ferrite-auth-oauth` | Google/GitHub/Discord OAuth2 + OIDC flows | **Works** |
| `ferrite-cache-redis` | Typed Redis `CacheService` | **Works** |
| `ferrite-cqrs` | Command bus, inbox/outbox, query DB | **Works** |
| `ferrite-graphql` | GraphQL module | Stub — module + limited init only |
| `ferrite-grpc` | tonic-based gRPC server | **Works** |
| `ferrite-health` | `/health` indicators | **Works** |
| `ferrite-i18n` | JSON catalogs + `I18nService` | **Works** |
| `ferrite-kafka` | Kafka produce/consume + handler registry | **Works** |
| `ferrite-log` | Logging integration | Works (simple) |
| `ferrite-nats` | NATS publish/subscribe + handler registry | **Works** |
| `ferrite-orm-diesel` | Diesel adapter | **Stub** — provider present, no `Pick`/`Store` impls |
| `ferrite-orm-sea` | SeaORM adapter + migrations harness | **Works** |
| `ferrite-orm-sqlx` | SQLx adapter | **Stub** — provider present, no `Pick`/`Store` impls |
| `ferrite-queue` | In-memory / Redis background jobs | **Works** |
| `ferrite-scheduler` | Cron jobs + `CronTicker` | **Works** |
| `ferrite-throttler` | Rate limiting guard/interceptor | **Works** |
| `ferrite-ws` | WebSocket gateways + rooms | **Works** |

## Feature flags on the umbrella crate

`ferrite-framework` gates ecosystem features so you compile only what you use:

```rust
use ferrite_framework::Orm;            // requires feature "Orm"
use ferrite_framework::Entity;         // requires feature "Orm"
```

| Feature | Pulls in |
| --- | --- |
| `I18n` | `ferrite-i18n` |
| `Orm` | `ferrite-orm` (no SQL deps) |
| `ws` | `ferrite-ws` |
| `grpc` | `ferrite-grpc` |

## Versioning & stability

- Every first-party crate is `=0.1.0` (exact-pinned, replace-first floating intentionally).
- `ferrite-spec` carries the LTS macro surface version so generated code can be validated against a known contract.
- Adding a new workspace member is a one-line change — see `ferrite-workspace` / `Cargo.toml` workspaces manifest.

## Next steps

- [CLI reference](/docs/ecosystem/cli-reference).
- [Roadmap](/docs/ecosystem/roadmap).