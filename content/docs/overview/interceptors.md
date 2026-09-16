---
title: Interceptors
description: Wrap the handler with before/after logic using the Interceptor trait and #[use_interceptors].
---

# Interceptors

Interceptors wrap **around** a handler: they run a "before" phase, invoke the rest of the pipeline, and run an "after" phase on the produced response. Use them for caching responses, timing handlers, mutating results, or adding response headers.

## The `Interceptor` trait

```rust
use ferrite_framework::{Interceptor, RequestCtx, Next, Response, async_trait};

#[derive(Default)]
pub struct LoggingInterceptor;

#[async_trait]
impl Interceptor for LoggingInterceptor {
    async fn intercept(&self, ctx: RequestCtx, next: Next) -> Response {
        eprintln!("before handler: {}", ctx.uri());
        let response = next(ctx).await;
        eprintln!("after handler: status {}", response.status());
        response
    }
}
```

## Applying interceptors

```rust
#[impl_controller]
impl UsersController {
    #[use_interceptors(LoggingInterceptor)]
    #[get("/")]
    pub async fn list(&self) -> Result<Json<Vec<User>>, HttpError> { /* ... */ }
}
```

Block-level application works too:

```rust
#[impl_controller]
#[use_interceptors(LoggingInterceptor)]
impl UsersController { /* ... */ }
```

Interceptors compose: declare multiple and they wrap the handler in order.

## A caching interceptor

Because the interceptor sees the raw `Response`, a trivial in-process cache is easy:

```rust
#[async_trait]
impl Interceptor for CachingInterceptor {
    async fn intercept(&self, ctx: RequestCtx, next: Next) -> Response {
        if let Some(hit) = self.cache.get(&ctx.uri().to_string()) {
            return axum::response::Response::new(hit);
        }
        let response = next(ctx).await;
        self.cache.put(ctx.uri().to_string(), response.body().to_owned());
        response
    }
}
```

> For battle-tested caching, use `ferrite-cache-redis` `CacheService` — see [Caching (Redis)](/docs/techniques/caching).

## Pipeline position

```text
Middleware → Guards → Interceptors(before) → Pipes → Handler → Interceptors(after) → Response
```

The "after" phase is where you can rewrite the response. Pipes do run inside the "before" phase (they transform inputs ahead of the handler).

## Next steps

- [Pipes](/docs/overview/pipes) — transform inputs before the handler.
- [Exception filters](/docs/overview/exception-filters).