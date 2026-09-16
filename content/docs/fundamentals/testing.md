---
title: Testing
description: Build in-memory test applications with TestingModule, override providers, and make assertions.
---

# Testing

`ferrite-testing` boots your real module graph **without binding a port you control** — it compiles the app, applies provider overrides, runs it on a random `127.0.0.1` port, and hands you a typed HTTP client. This mirrors NestJS's `Test.createTestingModule()`.

## A first test

```rust
use ferrite_testing::TestingModule;

#[tokio::test]
async fn health_returns_ok() {
    let app = TestingModule::new::<AppModule>().compile::<AppModule>().await;

    let res = app.get("/health").await;
    assert!(res.is_success());

    app.shutdown().await;
}
```

## The API

### `TestingModule`

```rust
let module = TestingModule::new::<AppModule>()
    .override_provider::<MailService>(FakeMailer::default())
    .with_env_vars(&[("DATABASE_URL", "sqlite::memory:")])
    .compile::<AppModule>()
    .await;
```

| Method | Purpose |
| --- | --- |
| `new::<M>()` | Start describing the module under test |
| `override_provider<T>(value)` | Replace a provider with your fake |
| `override_provider_arc<T>(arc)` | Replace with an already-`Arc`'d value |
| `with_env_vars(&[(&str, &str)])` | Set env vars for this run |
| `compile::<M>() -> TestApp` | Boot the app |

Under the hood this is `Ferrite::create_with_seed`.

### `TestApp`

```rust
app.port();                       // the bound port
app.base_url();                   // e.g. http://127.0.0.1:54321
app.get_provider::<MailService>(); // resolve the (possibly overridden) provider
app.container();                  // the raw container

app.get("/health").await;         // TestResponse
app.get_json("/users").await;     // serde_json::value
app.post_json("/users", &payload).await;
app.post_json_into::<T>("/users", &payload).await;  // deserialize body
app.put_json("/users/1", &payload).await;
app.patch_json("/users/1", &payload).await;
app.delete("/users/1").await;
app.send_custom(req).await;
```

Shutdown is graceful — a shutdown hook runs on drop, and `app.shutdown().await` is available explicitly.

### `TestResponse`

```rust
res.status();            // StatusCode
res.status_code();       // u16
res.is_success();
res.body_bytes();
res.body_text();
res.json::<T>();         // deserialize
res.json_value();        // serde_json::Value
```

## Putting it together

```rust
use ferrite_testing::TestingModule;

struct FakeMailer;

#[tokio::test]
async fn creating_a_user_uses_the_fake_mailer() {
    let app = TestingModule::new::<AppModule>()
        .override_provider::<MailService>(FakeMailer)
        .compile::<AppModule>()
        .await;

    let res = app.post_json("/users", &serde_json::json!({
        "email": "ada@example.com",
        "name": "Ada",
        "age": 36,
    })).await;

    assert_eq!(res.status_code(), 200);
    app.shutdown().await;
}
```

## Tips

- Write tests in `tests/` and run with `fr test` or `cargo test`.
- `ferrite-testing` binds a **random** port each run, so tests are portable and never collide.
- Use `with_env_vars` to isolate config (memory SQLite for DB tests, test JWT secrets, etc.).
- The avenue for real-DB e2e tests is the ORM adapter harness (`FERRITE_DB_ACTION`), covered in [Database (ORM)](/docs/techniques/database).

## Next steps

- [OpenAPI & Swagger](/docs/fundamentals/openapi-swagger).
- [Health checks](/docs/fundamentals/health-checks).