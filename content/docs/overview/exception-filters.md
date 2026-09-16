---
title: Exception filters
description: Centralize error responses with the ExceptionFilter trait and #[catch].
---

# Exception filters

Exception filters give you a single place to turn errors into HTTP responses. When a handler (or any downstream pipeline step) returns an `Err(HttpError)`, the pipeline looks for an attached exception filter and hands it the error.

## The `ExceptionFilter` trait

```rust
use ferrite_framework::{ExceptionFilter, HttpError, Response, axum};

pub struct AllExceptionsFilter {
    pub include_stack: bool,
}

impl ExceptionFilter for AllExceptionsFilter {
    fn catch(&self, err: HttpError) -> Response {
        axum::Json(serde_json::json!({
            "statusCode": err.status.as_u16(),
            "message": err.message,
            "stack": err.message,
        }))
        .into_response()
    }
}
```

Note that `catch` is **synchronous** (unlike guards and interceptors).

## Attaching filters

```rust
#[impl_controller]
impl UsersController {
    #[catch(AllExceptionsFilter { include_stack: true })]
    #[get("/{id}")]
    pub async fn show(&self, Path(id): Path<i64>) -> Result<Json<User>, HttpError> {
        let user = self.service.find(id)
            .await?
            .ok_or_else(|| HttpError::not_found("user"))?;
        Ok(Json(user))
    }
}
```

A filter instantiation expression (like `AllExceptionsFilter { include_stack: true }`) is attached per route. When the handler errors, `catch` builds the response.

## Default error body

Without a filter, `HttpError` renders as:

```json
{ "statusCode": 404, "message": "user not found" }
```

## HttpError

Constructors cover the common cases:

```rust
HttpError::new(StatusCode::IM_A_TEAPOT, "tea time")
HttpError::bad_request("...")     // 400
HttpError::unauthorized("...")    // 401
HttpError::forbidden("...")       // 403
HttpError::not_found("...")       // 404
HttpError::conflict("...")        // 409
HttpError::internal("...")        // 500
```

`HttpResult<T>` is a convenience alias:

```rust
pub type HttpResult<T> = Result<T, HttpError>;
```

## Pipeline

```text
Middleware → Guards → Interceptors(before) → Pipes → Handler → Interceptors(after) → Response
                         └────────────── Exception Filter on error ──────────────┘
```

Filters only run when a step returns `Err(HttpError)`; the intercepted response and after-phase interceptors still execute for successes.

## Next steps

- [Pipes](/docs/overview/pipes).
- [Controllers](/docs/overview/controllers).