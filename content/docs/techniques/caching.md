---
title: Caching (Redis)
description: Cache anything with ferrite-cache-redis CacheService and cache responses with interceptors.
---

# Caching (Redis)

`ferrite-cache-redis` is a small, typed Redis client: get/set with TTLs, counters, key listing, and a `roundtrip` helper for tests.

## Enable it

```cargo
fr add cache-redis
```

```rust
#[module(imports = [CacheModule])]
pub struct AppModule;
```

## `CacheService`

```rust
use ferrite_cache_redis::CacheService;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone)]
pub struct Profile { pub name: String }

#[injectable]
pub struct ProfilesService {
    cache: CacheService,
}

impl ProfilesService {
    #[inject]
    pub fn new(cache: CacheService) -> Self {
        Self { cache }
    }

    pub async fn get_profile(&self, id: i64) -> Result<Option<Profile>, CacheError> {
        self.cache.get::<Profile>(&format!("profile:{id}")).await
    }

    pub async fn set_profile(&self, id: i64, profile: &Profile) -> Result<(), CacheError> {
        self.cache
            .set_with_ttl(&format!("profile:{id}"), profile, 600)
            .await
    }
}
```

### API

| Method | Description |
| --- | --- |
| `get<T: DeserializeOwned>(key)` | Read and deserialize |
| `set<T: Serialize>(key, value)` | Write |
| `set_with_ttl<T>(key, value, secs)` | Write with expiry |
| `delete(key)` | Remove |
| `expire(key, secs)` | Set TTL on existing key |
| `ttl(key)` | Remaining TTL |
| `keys(pattern)` | Glob match |
| `incr(key)` / `decr(key)` / `incr_by(key, n)` | Counters |
| `exists(key)` | Presence |
| `clear_all()` | Flush the configured DB |
| `prefix()` / `key_for(suffix)` | Key namespace helpers |
| `roundtrip<T>()` | Test helper |

`CacheError` converts from `redis::RedisError` and `serde_json::Error`.

## Caching HTTP responses with an interceptor

Cache the whole handler result:

```rust
use ferrite_framework::{Interceptor, RequestCtx, Next, Response, async_trait};
use ferrite_cache_redis::CacheService;
use ferrite_framework::injectable;
use std::sync::Arc;

#[injectable]
pub struct ResponseCacheInterceptor {
    cache: CacheService,
}

impl ResponseCacheInterceptor {
    #[inject]
    pub fn new(cache: CacheService) -> Self {
        Self { cache }
    }
}

#[async_trait]
impl Interceptor for ResponseCacheInterceptor {
    async fn intercept(&self, ctx: RequestCtx, next: Next) -> Response {
        let key = self.cache.key_for(&ctx.uri().to_string());

        if let Ok(Some(body)) = self.cache.get::<Vec<u8>>(&key).await {
            return axum::response::Response::new(body.into());
        }

        let response = next(ctx).await;
        // optionally cache 200 responses (serialize the body)
        let body = response.body().to_owned();
        let _ = self.cache.set(&key, &body.to_vec()).await;
        Response::new(body)
    }
}
```

## Key namespacing

`CacheService` builds namespaced keys so services don't collide:

```rust
cache.key_for("users:1");       // e.g. "ferrite:users:1"
cache.key_for(&request_key);    // helper for request-scoped keys
```

## Notes

- All methods are async — they run on the Tokio runtime with the configured Redis connection.
- Use `fr test --coverage` + `roundtrip<T>()` for quick serialization smoke tests of your cache types.

## Next steps

- [Rate limiting](/docs/techniques/rate-limiting).
- [Interceptors](/docs/overview/interceptors).