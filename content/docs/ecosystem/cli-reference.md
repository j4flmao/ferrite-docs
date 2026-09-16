---
title: CLI reference
description: Every fr command and flag, from scaffolding to Cargo wrapper to DB migrations.
---

# CLI reference

The `fr` CLI is a thin, friendly wrapper over `cargo` plus Ferrite conveniences. Its exit code mirrors `cargo`'s — 0 success, 1 failure, 101 panic — so piping into CI is predictable.

## Global flags

```
-d, --debug      verbose output
    --quiet      only errors
-V, --version    print version
-h, --help       print help
```

## Commands

### build

```bash
fr build [-d] [--release]
```

Thin wrapper over `cargo build` (keeps your toolchain). `--release` maps to `cargo build --release`.

### run

```bash
fr run
fr run -- --args-for-the-app
```

`cargo run`, with `-d` lifted to `--verbose`.

### gen

```bash
fr gen
```

Prints what the build would generate — a preview of the entity (`Repository<E>`), route, and OpenAPI artifacts from the compile-time inventory.

### new

```bash
fr new <app_name> [--path=<path>]
```

Scaffold a new Ferrite application in `./<app_name>`.

### add

```bash
fr add <ecosystem-crate>
```

Import a first-party ecosystem crate into `Cargo.toml` **and** the corresponding `main.rs` snippet (module import + required env vars). Current catalog:

| Short name | Crate | Module / entries |
| --- | --- | --- |
| `auth-jwt` | `ferrite-auth-jwt` | `AuthModule` (requires `JWT_SECRET`) |
| `auth-oauth` | `ferrite-auth-oauth` | `OAuthModule` (env per provider) |
| `cache-redis` | `ferrite-cache-redis` | `CacheModule` |
| `cqrs` | `ferrite-cqrs` | `CqrsModule` |
| `ferrite-log` | `ferrite-log` | logging entry |
| `graphql` | `ferrite-graphql` | `GraphQLModule` |
| `grpc` | `ferrite-grpc` | `GrpcModuleImpl` |
| `health` | `ferrite-health` | `HealthModule` |
| `i18n` | `ferrite-i18n` | `I18nModuleImpl`, lints for `LOCALE_DIR` |
| `kafka` | `ferrite-kafka` | `KafkaModuleImpl` |
| `nats` | `ferrite-nats` | `NatsModuleImpl` |
| `orm` | `ferrite-orm` | ORM entry (in-memory store) |
| `orm-sqlx` | `ferrite-orm-sqlx` | provider registration only (stub) |
| `orm-diesel` | `ferrite-orm-diesel` | provider registration only (stub) |
| `rate-limit` | `ferrite-throttler` | `ThrottlerModule` |
| `queue` | `ferrite-queue` | `QueueModuleImpl` |
| `scheduler` | `ferrite-scheduler` | `CronModuleImpl` |
| `swagger` | `ferrite-swagger` | `SwaggerModule`, lints for `SWAGGER_*` envs |
| `ws` | `ferrite-ws` | WebSocket entries |

### test

```bash
fr test [--coverage] [--release] [-d]
```

Wrapper over `cargo test`. `--coverage` passes extra lint/test gates (and can report test counts).

### bib

Generate a `bib` (third-party attribution / license notice) file from the workspace:

```bash
fr bib > THIRD_PARTY.md
```

### doctor

```bash
fr doctor [--verbose]
```

Validate environment conventions and surface "expected set but missing" env vars across imported modules:

| Check | Behavior |
| --- | --- |
| `JWT_SECRET` missing & auth modules present | warning + hint |
| `DATABASE_URL` missing & ORM sea present | warning + hint |
| Unknown/misspelled `fr add` crate | error listing the catalog |
| `SWAGGER_*`, `LOCALE_DIR`, `NATS_URL`, `KAFKA_BROKERS` cross-checked | hint |

### openapi

```bash
fr openapi export -o <output.json>
```

> **Note:** currently writes a static placeholder file. For a real spec use `GET /openapi.json` from `ferrite-swagger` at runtime, or call `build_openapi()` in a test.

### db

Run the SeaORM migration harness:

```bash
fr db migrate-create <name>      # new migration up/down pair
fr db migrate                    # apply pending
fr db revert                     # roll back last applied
fr db seed                       # run seeds/*.sql
fr db status                     # applied vs pending report
```

Uses your app binary via `FERRITE_DB_ACTION`; requires `ferrite-orm-sea` wired into the app.

### doctor output shape

Exit 0 with warnings/errors printed. Exit 1 if the environment is unusable.

### compgen / completions

Built-in clap shell completions are available via the `-h` help paths (bash/zsh/fish/powershell) for power users.

## Next steps

- [Crates](/docs/ecosystem/crates).
- [Roadmap](/docs/ecosystem/roadmap).