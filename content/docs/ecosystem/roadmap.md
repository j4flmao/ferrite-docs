---
title: Roadmap
description: Where Ferrite is heading — verified statuses today, and the work queued up.
---

# Roadmap

Ferrite is at **v0.1.0**: the core compile-time DI, module model, routing macros, and a solid ecosystem all work today. This page is the honest state of the project: what's real now, what's a stub, and what's next.

## Today (v0.1.0, working)

- Compile-time modules, providers, injection, controllers, guards, interceptors, pipes, exception filters.
- `Repository<E>` ORM with in-memory and SeaORM adapters.
- JWT auth, OAuth2 (Google/GitHub/Discord), rate limiting, caching, background jobs, scheduling.
- NATS + Kafka messaging, gRPC, WebSockets, OpenAPI/Swagger, health checks, i18n.
- `fr` CLI: scaffold, `add`, test, db migrations, doctor, bib.
- `ferrite-testing`: replace providers, boot real graphs, run HTTP assertions.

## Stubs — flagged, not hidden

| Area | Status |
| --- | --- |
| `ferrite-orm-sqlx`, `ferrite-orm-diesel` | Providers registered, `Pick`/`Store` not implemented — compiler error if used |
| `ferrite-dashboard` | Placeholder output only |
| `ferrite-graphql` | Module + limited init; routes/schema not fleshed out |
| `fr openapi export` | Writes a static placeholder; use `GET /openapi.json` or `build_openapi()` |

These are the next candidates to graduate.

## Queued

- **SQLx & Diesel adapters**: implement `Pick<E>`/`Store<E>` for real pooling + queries.
- **GraphQL**: full query/resolver surface on the module model.
- **Dashboard**: live graphs of modules, providers, requests, and health.
- **`fr openapi export`**: render the real generated spec to a file via the compile-time inventory.
- **Multi-instance rate limiting**: Redis-backed ledgers for distributed throttling.

## Principles

1. **Honest stubs.** A stub fail-loudly at compile time rather than silently at runtime.
2. **Explicit > magic.** The graph is described in code; nothing implicit you can't read.
3. **Clone-friendly container.** `Container` is cheap; subsystems hold handles.
4. **Type-directed everything.** Providers resolve by `TypeId`; jobs, messages, commands by their type.

## Contributing

Check the repo's `CONTRIBUTING.md` on GitHub (`j4flmao/ferrite_rs`) for workspace conventions: add a crate under the workspace manifest, keep the LTS macro surface version bumped when macro output changes, and never ship a new stub without a compile-time error path.

## Next steps

- Back to [Introduction](/docs/overview/introduction).