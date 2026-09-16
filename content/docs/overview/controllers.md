---
title: Controllers
description: Handle incoming HTTP requests with #[controller], #[impl_controller] and route macros.
---

# Controllers

Controllers are the entry point for HTTP traffic. They bind **routes** to **handlers**, declare a route prefix, and can opt into the request pipeline (guards, interceptors, middleware, and exception filters).

## Define a controller

Declare a plain struct with the `#[controller("/prefix")]` macro, then implement your handlers inside an `#[impl_controller]` block:

```rust
use ferrite_framework::{controller, impl_controller, get, inject, Json, HttpError};

#[controller("/users")]
pub struct UsersController;

#[impl_controller]
impl UsersController {
    #[get("/")]
    pub async fn list(&self) -> Result<Json<Vec<User>>, HttpError> {
        // ...
    }
}
```

### Rules

- `#[controller]` applies to a **struct** (no generics) with at least one named field — or no fields at all, like `UsersController`.
- Every field is automatically rewritten to `Arc<T>`, so handlers hold cheap shared handles.
- `#[impl_controller]` applies to an **inherent impl block**, and every handler must be `async fn` taking `&self`.
- If the controllers struct has fields, provide its constructor with `#[inject]`:

```rust
#[controller("/users")]
pub struct UsersController {
    service: UsersService,
}

#[impl_controller]
impl UsersController {
    #[inject]
    pub fn new(service: UsersService) -> Self {
        Self { service }
    }

    #[get("/{id}")]
    pub async fn show(&self, Path(id): Path<i64>) -> Result<Json<User>, HttpError> {
        // ...
    }
}
```

### Route prefix

The prefix is taken from the first path argument. You can also pass `version`:

```rust
#[controller("/api/v1/users")]
pub struct UsersController;
```

## Route macros

| Macro | HTTP methods | Notes |
| --- | --- | --- |
| `#[get("/...")]` | GET | |
| `#[post("/...")]` | POST | |
| `#[put("/...")]` | PUT | |
| `#[patch("/...")]` | PATCH | |
| `#[delete("/...")]` | DELETE | |
| `#[all("/...")]` | ANY | registered with `axum::routing::any` |

Route patterns follow [Axum path syntax](https://docs.rs/axum/latest/axum/extract/struct.Path.html), so `{id}` captures a single segment:

```rust
#[impl_controller]
impl UsersController {
    #[get("/{id}")]
    pub async fn show(&self, Path(id): Path<i64>) -> Result<Json<User>, HttpError> { /* ... */ }

    #[post("/")]
    pub async fn create(&self, Json(dto): Json<CreateUserDto>) -> Result<Json<User>, HttpError> { /* ... */ }

    #[patch("/{id}")]
    pub async fn update(&self, Path(id): Path<i64>, Json(dto): Json<UpdateUserDto>) -> Result<Json<User>, HttpError> { /* ... */ }

    #[delete("/{id}")]
    pub async fn remove(&self, Path(id): Path<i64>) -> Result<Json<()>, HttpError> { /* ... */ }
}
```

## Handlers

Handlers can return anything that implements `IntoResponse` (Axum) — strings, `Json<T>`, `Result<T, HttpError>`, `StatusCode`, and so on.

### Extractors

Ferrite re-exports the Axum extractors you need:

- `Path<T>` — path parameters (`Path(id): Path<i64>`)
- `Query<T>` — query string (`Query(params): Query<SearchDto>`)
- `State<T>` — shared application state
- `Json<T>` from `ferrite_framework::Json` — the *validating* JSON extractor (see [Validation](/docs/overview/validation))
- `Json<T>` from `ferrite_framework::extract::Json` / `ferrite_http::Json` — the plain Axum JSON body codec

> Note: `ferrite_framework::Json` is the **validating** extractor. Plain Axum JSON lives at `ferrite_framework::extract::Json`. Services like `ferrite-health` import it as `HttpJson` to stay unambiguous.

### Errors

Return `Result<T, HttpError>` and use the typed constructors when you want to fail fast:

```rust
use ferrite_framework::HttpError;

return Err(HttpError::not_found("user"));
return Err(HttpError::bad_request("invalid payload"));
return Err(HttpError::unauthorized("missing token"));
return Err(HttpError::conflict("email already taken"));
```

An `HttpError` renders as `{"statusCode": <u16>, "message": "..."}`. To transform a *different* error type, chain it:

```rust
Err(HttpError::new(service.create(&dto).await.context("create user")?))
```

## Request context

For guards, middleware, and interceptors you'll interact with `RequestCtx`, which wraps the raw HTTP request parts:

```rust
use ferrite_framework::RequestCtx;

ctx.method()      // &str
ctx.uri()         // &Uri
ctx.headers()     // &HeaderMap
ctx.header("Authorization")
ctx.header_str("X-Trace-Id") -> Option<&str>
```

## Route metadata

The macros record per-route metadata (request body DTO types and guard types) into an inventory registry. `ferrite-swagger` reads this to generate OpenAPI request bodies and `401` security blocks automatically — see [OpenAPI & Swagger](/docs/fundamentals/openapi-swagger).

## Next steps

- [Providers](/docs/overview/providers) — build the services your controllers depend on.
- [Guards](/docs/overview/guards) — protect routes with `#[use_guards]`.
- [Pipes](/docs/overview/pipes) — transform and validate inputs.