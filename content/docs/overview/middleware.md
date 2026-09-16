---
title: Middleware
description: Run before any routing logic with the Middleware trait and #[use_middleware].
---

# Middleware

Middleware runs **first** in the request pipeline — before guards, interceptors, and pipes. Use it for concerns every request passes through: logging, request IDs, CORS headers, basic rate shaping, anything you want to run <em>before</em> routing decisions are made.

## The `Middleware` trait

```rust
use ferrite_framework::{Middleware, async_trait, RequestCtx, Next, Response};

#[derive(Default)]
pub struct RequestLogger;

#[async_trait]
impl Middleware for RequestLogger {
    async fn handle(&self, ctx: RequestCtx, next: Next) -> Response {
        let start = std::time::Instant::now();
        let method = ctx.method().to_string();
        let uri = ctx.uri().to_string();

        let response = next(ctx).await;

        eprintln!("{method} {uri} — {:?}", start.elapsed());
        response
    }
}
```

`handle` receives the request context and the `Next` continuation. Calling `next(ctx)` runs the rest of the pipeline and returns the `Response`; you can inspect or modify it before returning.

## Applying middleware

Attach middleware at the **impl block** level or **per method**:

```rust
#[impl_controller]
#[use_middleware(RequestLogger)]
impl UsersController {
    #[get("/")]
    pub async fn list(&self) -> Result<Json<Vec<User>>, HttpError> { /* ... */ }

    // This route gets RequestLogger AND RequestTiming
    #[use_middleware(RequestTiming)]
    #[get("/{id}")]
    pub async fn show(&self, Path(id): Path<i64>) -> Result<Json<User>, HttpError> { /* ... */ }
}
```

The type must implement `Middleware`. Multiple middleware names are allowed with commas.

## Request context helpers

`Middleware` runs with a `RequestCtx`:

```rust
ctx.method();                 // &str, e.g. "GET"
ctx.uri();                    // &Uri
ctx.headers();                // &HeaderMap
ctx.header("X-Request-Id");   // Option<&HeaderValue>
ctx.header_str("X-Request-Id") // Option<&str>
```

## Pipeline order

```text
Middleware → Guards → Interceptors(before) → Pipes → Handler → Interceptors(after) → Response
                         └────────────── Exception Filter on error ──────────────┘
```

Middleware is positioned at the very front, so it always sees the request first and the response last.

## Distinction from interceptors

| | Middleware | Interceptor |
| --- | --- | --- |
| Position | before everything | wraps the handler (before + after) |
| Typical use | logging, request IDs, headers | caching, timing handlers, transforming responses |
| Trait method | `handle` | `intercept` |

## Next steps

- [Guards](/docs/overview/guards) — authorization for routes.
- [Interceptors](/docs/overview/interceptors).
- [Exception filters](/docs/overview/exception-filters).