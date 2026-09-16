---
title: Configuration
description: Manage environment configuration with ConfigService, .env files and ferrite.toml.
---

# Configuration

Ferrite reads configuration from four layers, with later layers overriding earlier ones. `ConfigService` is a global singleton — you can inject it anywhere, from services to auth and ORM adapters.

## Sources & precedence

| Priority | Source |
| --- | --- |
| 5 (highest) | Real process environment |
| 4 | `.env.<FERRITE_ENV>` (e.g. `.env.production`) |
| 3 | `.env` |
| 2 | `ferrite.toml` (flattened) |
| 1 (lowest) | Hardcoded defaults (`APP_ENV=development`, `PORT=3000`) |

## Using `ConfigService`

```rust
use ferrite_framework::{injectable, inject, ConfigService};

#[injectable]
pub struct AppService {
    config: ConfigService,
}

impl AppService {
    #[inject]
    pub fn new(config: ConfigService) -> Self {
        Self { config }
    }

    pub fn env(&self) -> String {
        self.config.get_or("APP_ENV", "development")
    }

    pub fn port(&self) -> u16 {
        self.config.get_or_parse("PORT", 3000u16)
    }
}
```

### API

| Method | Description |
| --- | --- |
| `get(key) -> Option<String>` | Raw lookup |
| `get_or(key, default) -> String` | Lookup with a fallback |
| `get_or_parse::<T>(key, default) -> T` | Parse with `FromStr`, fall back on failure |
| `contains(key) -> bool` | Presence check |
| `all() -> HashMap<String, String>` | Entire merged map |

### Loading

`ConfigService::load()` merges everything. `load_from(dir)` reads from a specific directory, and `merge_layers(dir, real_env)` gives you full control. The `#[bootstrap]` macro calls `load_env_file()` automatically for `.env*`, without overriding existing process variables.

## `ferrite.toml`

TOML sections are flattened into `SECTION__KEY` variables:

```toml
[app]
name = "my-api"

[server]
transport = "http"
host = "0.0.0.0"
port = 3000
```

becomes:

```text
APP__NAME=my-api
SERVER__TRANSPORT=http
SERVER__HOST=0.0.0.0
SERVER__PORT=3000
```

Scaffold one quickly:

```bash
fr generate config
```

## `.env` files

`.env.example` is scaffolded for you:

```bash
fr generate env
```

```dotenv
APP_ENV=development
PORT=3000
DATABASE_URL=postgres://user:pass@localhost:5432/app
JWT_SECRET=change-me
```

Per-environment files load automatically based on `FERRITE_ENV` / `APP_ENV`:

```bash
fr up --env production   # additionally loads .env.production
```

## What uses configuration

- `ferrite-auth-jwt` — `JWT_SECRET`, `JWT_EXPIRES_IN`
- `ferrite-auth-oauth` — `<PROVIDER>_OAUTH_CLIENT_ID`, `_CLIENT_SECRET`, `_REDIRECT_URI`
- `ferrite-orm-sqlx` / diesel / sea — `DATABASE_URL`
- `ferrite-swagger` — `SWAGGER_TITLE`, `SWAGGER_VERSION`, `SWAGGER_DESCRIPTION`, `SWAGGER_SERVER_URL`
- `ferrite-grpc` — `GRPC_HEALTH_TIMEOUT_MS`
- `ferrite-cache-redis` — Redis connection settings

## Verification

```bash
fr doctor
```

checks that `.env`, `ferrite.toml`, and `DATABASE_URL` are present and reports on the toolchain.

## Next steps

- [Validation](/docs/overview/validation).
- [Environment files](/docs/overview/cli-usage#generate).