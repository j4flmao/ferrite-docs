---
title: Providers
description: Services registered with the container and injected with #[injectable] and #[inject].
---

# Providers

Providers are the building blocks of Ferrite. Anything you want to *share* or *resolve* through dependency injection — services, repositories, infrastructure clients — is a provider. Each provider is registered with the DI container and resolved by type.

## `#[injectable]`

Mark a struct as a provider:

```rust
use ferrite_framework::{injectable, inject};

#[injectable]
pub struct UsersService {
    db: Repository<User>,
}

impl UsersService {
    #[inject]
    pub fn new(db: Repository<User>) -> Self {
        Self { db }
    }
}
```

### Rules

- Applies to a **struct** (no generics).
- Fields are automatically rewritten to `Arc<T>`, so you can clone handles cheaply.
- You must supply a constructor with `#[inject]` on `pub fn new(...)`.
- Parameter types of `new` become the provider's dependencies.

### Scopes

```rust
#[injectable(scope = "singleton")]  // default — one instance for the app lifetime
#[injectable(scope = "request")]    // one instance per request
#[injectable(scope = "transient")]  // a fresh instance every resolution
```

Anything that isn't `request` or `transient` registers as a singleton. `Scope { Singleton, Request, Transient }` mirrors this at the runtime level.

## `#[inject]`

`#[inject]` annotates the constructor. It rewrites each parameter to `Arc<T>` and generates two functions:

- `__ferrite_deps()` → the ordered `Vec<TypeId>` of dependencies
- `__ferrite_inject(&Container)` → resolves each dependency from the container and calls the constructor

Zero-dependency constructors are supported too:

```rust
#[injectable]
pub struct AppService;

impl AppService {
    #[inject]
    pub fn new() -> Self {
        Self
    }
}
```

## Resolution & injection

Handlers and controllers access providers through constructor injection:

```rust
use ferrite_framework::{injectable, inject};

#[injectable]
pub struct HealthController {
    service: AppService,
}

impl HealthController {
    #[inject]
    pub fn new(service: AppService) -> Self {
        Self { service }
    }
}
```

## The container

`#[injectable]` registers a `ProviderEntry` into an `inventory` registry at compile time. At bootstrap, Ferrite assembles a `fr_core::Container`:

- `Container::get<T>() -> Arc<T>` — panics on resolution failure
- `Container::try_get<T>() -> Option<Arc<T>>`
- `Container::seed_singleton<T>(value: Arc<T>)` — pre-populate a provider before the graph compiles

The running app exposes its container, which is how subsystems mount themselves:

```rust
let app = Ferrite::create::<AppModule>().await;
let container = &app.container;
let service: Arc<AppService> = container.get::<AppService>();
```

## Global providers

Some providers are registered **globally** — resolvable without being imported by a module. Examples:

- `ConfigService`
- `InMemoryPick` (ORM)
- `WsServer` (WebSockets)
- `GrpcServer` (gRPC)

These register directly into inventory from their crates, so any module can inject them.

## Next steps

- [Modules](/docs/overview/modules) — group providers and controllers.
- [Dependency injection](/docs/fundamentals/dependency-injection) — the full DI story.
- [Configuration](/docs/overview/configuration) — `ConfigService` in depth.