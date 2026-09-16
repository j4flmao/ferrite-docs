---
title: Dependency injection
description: A deep dive into compile-time dependency injection, the container, scopes and graph composition.
---

# Dependency injection

Dependency injection is what holds Ferrite together. Every provider contributes graph metadata at **compile time**, and bootstrap assembles the graph into a runtime `Container`. The two halves — compile-time description, runtime resolution — are deliberately split.

## The contract

```rust
pub trait Injectable {
    fn __provider_entry() -> ProviderEntry;
}
```

`ProviderEntry` describes everything the container needs to build the provider:

```rust
impl ProviderEntry {
    pub fn new_static::<T>(
        name: &'static str,
        scope: Scope,
        deps: fn() -> Vec<TypeId>,
        factory: fn(&Container) -> AnyArc,
    ) -> ProviderEntry;
}
```

- `deps` is the explicit, ordered list of dependencies.
- `factory` receives the container and returns the fully-constructed provider as `Arc<dyn Any + Send + Sync>`.

`#[injectable]` + `#[inject]` generate both functions for you:

```rust
#[injectable]
pub struct MailService {
    config: ConfigService,
}

impl MailService {
    #[inject]
    pub fn new(config: ConfigService) -> Self {
        Self { config }
    }
}
```

`__ferrite_deps()` returns `[TypeId::of::<ConfigService>()]`, and `__ferrite_inject` resolves it, calls `MailService::new(arc)`, and wraps the result in an `Arc`.

## Scopes

```rust
pub enum Scope {
    Singleton,
    Request,
    Transient,
}
```

| Scope | Lifetime | Annotation |
| --- | --- | --- |
| Singleton | One instance for the whole app | `#[injectable]` / `scope = "singleton"` |
| Request | One per request | `scope = "request"` |
| Transient | A new instance per resolution | `scope = "transient"` |

## The container

```rust
pub struct Container { /* ... */ }

impl Container {
    pub fn get<T>(&self) -> Arc<T>;              // panics on failure
    pub fn try_get<T>(&self) -> Option<Arc<T>>;
    pub fn get_any(&self, id: TypeId) -> AnyArc;
    pub fn try_get_any(&self, id: TypeId) -> Option<AnyArc>;
    pub fn seed_singleton<T>(&self, value: Arc<T>);
}
```

`Container` is cheap to clone, so subsystems can hold a handle and resolve providers lazily.

## Discovery utilities

```rust
use ferrite_framework::{
    all_modules, all_providers, find_module, lookup_module,
    lookup_provider, sort_providers, sort_providers_with,
};

all_modules();                    // Vec<&'static ModuleDescriptor>
find_module("AppModule");         // Option<&'static ModuleDescriptor>
all_providers();                  // Vec<&'static ProviderEntry>
lookup_provider::<MailService>(); // type-directed lookup
```

`sort_providers`/`sort_providers_with` order providers deterministically so the graph compiles the same way on every build.

## Compile-time guarantees

Because metadata is static, Ferrite can type-check the graph *while it compiles*:

1. `#[module]` verifies imports implement `Module` and providers implement `Injectable`.
2. `#[inject]` verifies every parameter has a matching registered provider (or a global one).
3. Cycles surface as compiler errors rather than stack overflows.

The macro surface is covered by an LTS constant, `FERRITE_LTS_MACRO_SURFACE_VERSION`, so the generated code can be validated against a known contract.

## Overriding providers

For tests and A/B behavior, seed the container before the graph compiles:

```rust
use std::sync::Arc;
use ferrite_framework::Ferrite;

let app = Ferrite::create_with_seed::<AppModule, _>(|container| {
    container.seed_singleton(Arc::new(FakeMailer));
}).await;
```

`ferrite-testing` wraps this pattern for you — see [Testing](/docs/fundamentals/testing).

## Verbose example

One provider depending on several others, resolved by type only:

```rust
#[injectable]
pub struct OrderController {
    orders: OrdersService,
    mail: MailService,
    cache: CacheService,
}

impl OrderController {
    #[inject]
    pub fn new(orders: OrdersService, mail: MailService, cache: CacheService) -> Self {
        Self { orders, mail, cache }
    }
}
```

## Next steps

- [Modules](/docs/overview/modules).
- [Lifecycle events](/docs/fundamentals/lifecycle-events).