---
title: Rate limiting
description: Protect endpoints with fixed-window throttling via ThrottlerGuard and ThrottlerInterceptor.
---

# Rate limiting

`ferrite-throttler` adds fixed-window rate limiting with an in-memory ledger, exposed both as a guard and as an interceptor.

## Enable it

```cargo
fr add throttler
```

```rust
#[module(imports = [ThrottlerModule])]
pub struct AppModule;
```

## `ThrottlerService`

The engine:

```rust
use ferrite_throttler::ThrottlerService;

#[injectable]
pub struct SignupController {
    throttler: ThrottlerService,
}

impl SignupController {
    #[inject]
    pub fn new(throttler: ThrottlerService) -> Self {
        Self { throttler }
    }

    pub async fn hit(&self, key: String) -> Result<HitOk, HitLimit> {
        self.throttler.hit(key, self.throttler.default_limit(), self.throttler.default_window()).await
    }
}
```

| Method | Returns |
| --- | --- |
| `hit(key, limit, window_secs)` | `HitOk{used}` or `HitLimit{used}` |
| `peek(key)` | Current count without increment |
| `reset(key)` | Clear a key |
| `purge_old()` | Drop expired windows |
| `key_for_request(&RequestCtx)` | Derive a key from the request (e.g. IP) |
| `default_limit()` / `default_window()` | Config-backed defaults |

`now_secs()` exposes the current time source (easy to stub in tests).

## Guard usage

Deny requests that exceed the limit:

```rust
use ferrite_throttler::ThrottlerGuard;

#[impl_controller]
impl SignupController {
    #[use_guards(ThrottlerGuard)]
    #[post("/")]
    pub async fn signup(&self, Json(dto): Json<SignupDto>) -> Result<Json<()>, HttpError> {
        // 429 when the client exceeds the window
        Ok(Json(()))
    }
}
```

## Interceptor usage

The same policy as an interceptor over a whole block:

```rust
#[impl_controller]
#[use_interceptors(ThrottlerInterceptor)]
impl SignupController { /* ... */ }
```

`ThrottlerInterceptor` implements `Interceptor` and rejects with 429 when the budget is spent.

## Behavior

- Fixed-window counting per key with a configurable window (`default_window`).
- `purge_old` keeps the ledger tidy; the interceptor runs it opportunistically.
- Keys are request-scoped (`key_for_request`) by default — override if you want per-user budgets.
- Because it's in-memory, it's per-instance. For multi-instance throttling, pair it with the Redis counter helpers in `ferrite-cache-redis`.

## Next steps

- [Guards](/docs/overview/guards).
- [Background jobs](/docs/techniques/background-jobs).