---
title: CLI usage
description: A complete tour of the fr CLI and the frt alias.
---

# CLI usage

The `fr` CLI is the primary way to create projects, generate artifacts, and operate an app. It is installed from crates.io as `fr-cli`, and also ships an `frt` alias.

## Command overview

| Command | Description |
| --- | --- |
| `fr new <name>` | Scaffold a new project |
| `fr templates` | List templates |
| `fr up` | Run the dev server with hot reload |
| `fr build` | Build the project |
| `fr run` | Run the project in the foreground |
| `fr test [suite]` | Run tests |
| `fr lint` | Clippy presets |
| `fr fmt` | `cargo fmt` |
| `fr forge <schematic> <name>` | Generate artifacts |
| `fr add <package>` / `fr remove <package>` | Manage ecosystem crates |
| `fr db <action>` | Database lifecycle |
| `fr openapi export` | Export an OpenAPI spec |
| `fr doctor` | Environment & toolchain checks |
| `fr info` | Project report |
| `fr generate <what>` | Scaffold config/env |
| `fr docs` | Build or serve documentation |

## Project lifecycle

```bash
fr new my-api                  # scaffold (api template by default)
cd my-api

fr up                          # dev server with cargo-watch
fr build --release             # optimized build -> target/release/
fr run                         # run in the foreground
fr test                        # unit tests
fr test --suite e2e --watch    # e2e suite, watching
fr test --coverage             # cargo-llvm-cov
```

## Artifacts

```bash
fr forge module users
fr forge controller users --module users
fr forge service users --module users
fr forge resource users           # full CRUD scaffold
fr forge guard admin              # guard, middleware, interceptor, pipe, filter, provider...
```

Options: `--module <name>` (default `app`), `--flat`, `--no-spec`, `--dry-run`.

## Ecosystem management

```bash
fr add auth-jwt          # ferrite-auth-jwt pinned =0.1.0
fr add orm-sqlx swagger
fr remove throttler
```

The 19 supported short names are listed in [Ecosystem crates](/docs/ecosystem/crates).

## Database

```bash
fr db migrate            # apply migrations (runs the app with FERRITE_DB_ACTION=migrate)
fr db migrate-create add_users_table   # write up.sql / down.sql stubs
fr db revert
fr db seed
fr db status
```

> `fr db studio` currently prints an informational stub (no bundled DB GUI).

## OpenAPI

```bash
fr openapi export
```

> The current CLI ships an informational stub that writes a static, empty `openapi.json`. The runtime `ferrite-swagger` in-app endpoint (`GET /openapi.json`) generates the full spec — see [OpenAPI & Swagger](/docs/fundamentals/openapi-swagger).

## Operational

```bash
fr doctor            # rustc/cargo/cargo-watch/mdbook + env checks
fr info              # project name, version, edition, ferrite deps
fr lint              # clippy --all-features -- -D warnings
fr fmt               # cargo fmt
```

`fr doctor` also runs "Ferrite ecosystem semver lockstep checks" against your `Cargo.toml`, failing the exit code unless every ferrite dependency resolves to the same pinned release (set `FERRITE_DOCTOR_LENIENT=1` to soften).

## Generate

```bash
fr generate config    # ferrite.toml with [app] and [server] sections
fr generate env       # .env.example with APP_ENV, PORT, DATABASE_URL, JWT_SECRET
```

Both are no-ops if the file already exists.

## Documentation

```bash
fr docs build         # requires mdbook; builds docs/book.toml
fr docs serve --port 3001
```

## Next steps

- [Ecosystem crates](/docs/ecosystem/crates).
- [CLI reference](/docs/ecosystem/cli-reference) — every flag in one place.