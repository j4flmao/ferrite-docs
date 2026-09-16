---
title: Health checks
description: Expose liveness and custom health indicators with ferrite-health.
---

# Health checks

`ferrite-health` gives you a `/health` endpoint that aggregates **indicators** — small checks your infrastructure and load balancers can probe. Indicators run in parallel, and the endpoint reports aggregate status.

## Enable it

```rust
#[module(imports = [HealthModule])]
pub struct AppModule;
```

```bash
curl http://localhost:3000/health
```

```json
{
  "status": "UP",
  "indicators": {
    "app": { "status": "UP" }
  }
}
```

The default `LivenessIndicator` reports the app as up.

## Custom indicators

Implement `HealthIndicator`:

```rust
use ferrite_health::{HealthIndicator, Health, HealthResult, submit_indicator};
use ferrite_framework::async_trait;

pub struct CacheHealthIndicator {
    pub key: String,
}

#[async_trait]
impl HealthIndicator for CacheHealthIndicator {
    fn name(&self) -> &'static str {
        "cache"
    }

    async fn check(&self) -> HealthResult {
        match self.client.ping().await {
            Ok(_) => Health::up().finish(),
            Err(err) => Health::down()
                .with_details(serde_json::json!({ "error": err.to_string() }))
                .finish(),
        }
    }
}
```

Register it with `submit_indicator!` (the type must be `Default`):

```rust
submit_indicator!(CacheHealthIndicator);
```

The aggregate body nests each indicator under its `name`:

```json
{
  "status": "DOWN",
  "indicators": {
    "app": { "status": "UP" },
    "cache": { "status": "DOWN", "details": { "error": "connection refused" } }
  }
}
```

## The `Health` builder

```rust
Health::up().finish();            // HealthResult { UP, details: null }
Health::down().with_details(json).finish();
Health::out_of_service().finish();
Health::unknown().finish();
```

Statuses serialize as `"UP"`, `"DOWN"`, `"OUT_OF_SERVICE"`, `"UNKNOWN"`.

## Behavior

- Indicators run **in parallel** (`join_all`), so slow checks don't serialize.
- The aggregate is `DOWN` if any indicator is down.
- `HealthService` is an `#[injectable]`; inject it if you need to report health from tests or dashboards.

## Next steps

- [OpenAPI & Swagger](/docs/fundamentals/openapi-swagger).
- [Testing](/docs/fundamentals/testing).