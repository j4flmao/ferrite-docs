---
title: First steps
description: Install the fr CLI, scaffold your first project, and run it with hot reload.
---

# First steps

This guide walks you through installing the Ferrite CLI, scaffolding a project, and running your first endpoint.

## What you'll need

- **Rust** toolchain (stable), with `cargo`
- **Node.js** is *not* required — Ferrite is 100% Rust
- For live reload: [`cargo-watch`](https://crates.io/crates/cargo-watch) (optional, used by `fr up`)
- For documentation perusals: `mdbook` (optional, used by `fr docs`)

You can verify the toolchain at any time with:

```bash
fr doctor
```

## 1. Install the CLI

The `fr` binary is published as `fr-cli`:

```bash
cargo install fr-cli
fr --version
```

`fr` also exposes a `frt` alias if you prefer a shorter name on disk.

## 2. Scaffold a project

```bash
fr new my-api
cd my-api
```

`fr new` supports a few templates and options:

```bash
fr new my-api --template api        # default: single-crate REST service
fr new my-svc --template microservice # gRPC + NATS playground
fr new monorepo --template workspace  # apps/ + libs/ monorepo
fr new my-api --pm sqlx              # add a database adapter + migrations/
fr new my-api --no-git               # skip `git init`
```

List all templates with:

```bash
fr templates
```

## 3. Project layout

A default `api` project looks like this:

```text
my-api/
├── Cargo.toml
├── ferrite.toml
├── .env.example
├── src/
│   ├── main.rs                 # #[bootstrap] + Ferrite::create::<AppModule>()
│   ├── app_module.rs           # #[module] root
│   ├── app_service.rs
│   ├── modules/
│   │   └── health.rs           # GET /health
│   └── users/
│       ├── mod.rs
│       ├── models.rs
│       ├── dto.rs
│       ├── users_controller.rs
│       └── users_service.rs
└── tests/
    └── health_e2e.rs
```

## 4. Run it

Start the dev server with hot reload:

```bash
fr up
```

Then hit the health endpoint:

```bash
curl http://localhost:3000/health
# {"status":"ok","env":"development"}
```

Useful run variants:

```bash
fr up --port 8080          # change the port
fr up --env production     # load .env.production
fr up --no-reload          # plain `cargo run`, no file watching
fr run                     # foreground run, no watching
```

## 5. Generate artifacts

The CLI can scaffold common building blocks without copying code from memory:

```bash
fr forge module users
fr forge controller users --module users
fr forge service users --module users
fr forge resource users      # module + controller + service + dto + entity
```

Supported kinds: `module`, `controller`, `service`, `resource`, `dto`, `entity`, `guard`, `middleware`, `interceptor`, `pipe`, `filter`, `provider`.

## 6. Manage the ecosystem

Attach ecosystem crates in one command (versions are pinned to the matching framework release):

```bash
fr add auth-jwt
fr add orm-sea
fr add swagger validation
fr remove throttler
```

## 7. Run tests and checks

```bash
fr test                 # cargo test (unit suite)
fr test --suite e2e     # cargo test --test e2e
fr test --watch         # cargo-watch based
fr test --coverage      # cargo-llvm-cov based
fr lint                 # clippy with -D warnings
fr fmt                  # cargo fmt
```

## Next steps

Your project is running. Now learn how the pieces fit together:

- [Controllers](/docs/overview/controllers) — define HTTP handlers.
- [Providers](/docs/overview/providers) — services and `#[inject]`.
- [Modules](/docs/overview/modules) — the root `AppModule`.
- [CLI usage](/docs/overview/cli-usage) — the full command surface.