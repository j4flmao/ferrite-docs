---
title: Modules
description: Encapsulate related functionality with #[module] — imports, providers, controllers and exports.
---

# Modules

Modules are the primary way to organize an application into coherent units. A module brings together **controllers**, **providers**, and dependencies on **other modules**, and controls what it exposes to the rest of the world.

## `#[module]`

```rust
use ferrite_framework::{module, Module};

#[module(
    imports = [AuthModule],
    controllers = [UsersController],
    providers = [UsersService, UsersRepository],
    exports = [UsersService],
)]
pub struct UsersModule;
```

| Key | Meaning |
| --- | --- |
| `imports` | Other modules whose exported providers become resolvable here |
| `controllers` | Controller structs whose routes are registered |
| `providers` | Providers instantiated and made available within this module |
| `exports` | Providers re-exported to modules that import this one |
| `global` | Flag marking all exports as globally available |

Only unit structs are supported:

```rust
pub struct UsersModule;
```

The macro type-asserts everything: imported names must implement `Module`, and providers/controllers/exports must implement `Injectable`. Mistakes become compiler errors.

## The root module

Every application has one root module that imports everything else:

```rust
use ferrite_framework::{module, Ferrite};

#[module(
    imports = [AuthModule, HealthModule, SwaggerModule, UsersModule],
)]
pub struct AppModule;

#[bootstrap]
async fn main() {
    let app = Ferrite::create::<AppModule>().await;
    app.listen("0.0.0.0:3000").await.expect("failed to bind");
}
```

## The module descriptor

At compile time the macro emits a `ModuleDescriptor`:

```rust
pub struct ModuleDescriptor {
    pub name: String,
    pub providers: Vec<TypeId>,
    pub controllers: Vec<TypeId>,
    pub imports: Vec<TypeId>,
    pub exports: Vec<TypeId>,
    pub middleware: Vec<TypeId>,
    pub global: bool,
}
```

Discovery helpers walk these descriptors at runtime:

```rust
use ferrite_framework::{all_modules, find_module, all_providers, lookup_provider};

all_modules()                       // Vec<&ModuleDescriptor>
find_module("UsersModule")          // Option<&ModuleDescriptor>
all_providers()                     // Vec<&ProviderEntry>
lookup_provider::<UsersService>()   // Unique lookup by type
```

## Module providers and global registration

When a module lists a provider in `providers` or `exports`, it contributes a `ProviderEntry` to the inventory registry. Providers with no module — like infrastructure singletons — register themselves globally.

Modules from ecosystem crates generally expose a ready-made struct:

```rust
#[module(imports = [AuthModule, HealthModule, SwaggerModule, CacheModule, ThrottlerModule])]
pub struct AppModule;
```

## Extending modules with ecosystem modules

Features ship as **modules + providers** together. For example:

- `AuthModule` — JWT `JwtService`, `AuthGuard`, `CurrentUser`
- `HealthModule` — `HealthService`, `HealthController` at `/health`
- `SwaggerModule` — `SwaggerService`, Swagger UI at `/docs`
- `CacheModule` — `CacheService`
- `ThrottlerModule` — `ThrottlerService`, `ThrottlerGuard`

## Next steps

- [Bootstrap](/docs/overview/bootstrap) — how `Ferrite::create` compiles the graph.
- [Dependency injection](/docs/fundamentals/dependency-injection).
- [Testing](/docs/fundamentals/testing) — override providers in a `TestingModule`.