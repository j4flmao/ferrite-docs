---
title: Bootstrap
description: Boot your application with #[bootstrap], Ferrite::create and the async runtime.
---
# Bootstrap

Bootstrapping is the moment Ferrite assembles the module graph, instantiates providers, and binds your router. It maps directly to what NestJS calls the "factory" phase of application startup.

## `#[bootstrap]`

Annotate any `async fn main()`:

```rust
use ferrite_framework::{bootstrap, Ferrite};

#[bootstrap]
async fn main() {
    let app = Ferrite::create::<AppModule>().await;
    app.listen("0.0.0.0:3000").await.expect("failed to bind 0.0.0.0:3000");
}
```

The macro rewrites this into a synchronous `main` that:

1. Loads environment files (`load_env_file()`) from `.env*`,
2. Creates a `tokio::runtime::Runtime`,
3. Runs your async body on it with `block_on`.

You never write `#[tokio::main]` yourself.

## `Ferrite::create`

```rust
impl Ferrite {
    pub async fn create<M: Module>() -> App;
    pub async fn create_with_seed<M: Module, F: FnOnce(&Container)>(seed: F) -> App;
}
```

`create::<M>()` finds the module descriptor for `M`, collects every provider and controller registered in the inventory registries, assembles the dependency graph, and instantiates singletons. `create_with_seed` additionally let you seed the container **before** the graph compiles — this is what `ferrite-testing` uses to override providers:

```rust
Ferrite::create_with_seed::<AppModule, _>(|container| {
    container.seed_singleton(Arc::new(FakeMailer));
})
```

If anything in the graph is missing or cyclic, you get a compiler error — not a runtime failure.

## The `App`

`create` returns the running application:

```rust
pub struct App {
    pub router: axum::Router,     // the assembled router (nest extra routes in)
    pub container: Container,     // the compiled container
}
```

### `listen`

```rust
impl App {
    pub async fn listen(self, addr: &str) -> Result<(), std::io::Error>;
}
```

```rust
let app = Ferrite::create::<AppModule>().await;
app.listen(&format!("0.0.0.0:{port}")).await.expect("failed to bind port");
```

### Access the router for extra nesting

Mount third-party Axum routers, or hand the router to a custom server:

```rust
let app = Ferrite::create::<AppModule>().await;
// for example, WebSockets mount onto the router:
ferrite_ws::mount_on(&mut app.router, app.container.clone(), "/ws");

app.listen("0.0.0.0:3000").await?;
```

### Access the container post-compile

Resolve any registered provider after the graph is built:

```rust
let app = Ferrite::create::<AppModule>().await;
let grpc: Arc<GrpcServer> = app.container.get::<GrpcServer>();
tokio::spawn(async move { grpc.start("0.0.0.0:50051").await });
```

## Port configuration

The scaffold reads `PORT` from the environment (defaults to `3000`):

```rust
let port = std::env::var("PORT").unwrap_or_else(|_| "3000".into());
app.listen(&format!("0.0.0.0:{port}")).await
```

> `[server] port = 3000` in `ferrite.toml` is loaded by `ConfigService` into `SERVER__PORT` — see [Configuration](/docs/overview/configuration) for the layered resolution rules.

## Next steps

- [Lifecycle events](/docs/fundamentals/lifecycle-events) — hooks that run around startup and shutdown.
- [Configuration](/docs/overview/configuration).