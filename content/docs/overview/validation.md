---
title: Validation
description: Validate DTOs at the boundary with #[derive(Validate)], the validating Json<T> extractor and ValidationPipe.
---

# Validation

Ferrite validates data **at the boundary** — when it crosses into your application. Define declarative rules on your DTOs with `#[derive(Validate)]`, then let the validating `Json<T>` extractor and `ValidationPipe` reject bad payloads.

## `#[derive(Validate)]`

```rust
use serde::Deserialize;
use ferrite_framework::{Validate, Json};

#[derive(Debug, Deserialize, Validate)]
pub struct CreateUserDto {
    #[validate(email)]
    pub email: String,

    #[validate(not_empty)]
    #[validate(length(min = 3, max = 64))]
    pub name: String,

    #[validate(range(min = 18, max = 120))]
    pub age: i32,
}
```

### Rules

| Rule | Meaning |
| --- | --- |
| `#[validate(email)]` | Value must look like an email |
| `#[validate(not_empty)]` | Non-empty string |
| `#[validate(length(min = n, max = m))]` | Length bounds |
| `#[validate(range(min = n, max = m))]` | Numeric bounds |

> Fields that are `Option` or `Vec` and generic structs are rejected at compile time.

## The validating `Json<T>` extractor

Return it from a handler and validation happens on deserialize:

```rust
use ferrite_framework::{controller, impl_controller, post, Json, HttpError};
use ferrite_framework::{Validate};
use serde::Deserialize;

#[derive(Deserialize, Validate)]
pub struct CreateUserDto { /* ... */ }

#[impl_controller]
impl UsersController {
    #[post("/")]
    pub async fn create(&self, Json(dto): Json<CreateUserDto>) -> Result<Json<User>, HttpError> {
        // dto is already validated here
        Ok(Json(self.service.create(&dto).await?))
    }
}
```

Behavior of `ferrite_framework::Json<T>` (which is *not* the plain Axum `Json`):

| Condition | Response |
| --- | --- |
| Malformed JSON | `400` `{"statusCode":400,"message":"invalid JSON body"}` |
| Validation fails | `422` with the full errors object |
| Valid | `200` with the validated value |

## The errors object

`ValidationErrors` serializes per-field:

```json
{
  "errors": {
    "email": ["email must be a valid email address"],
    "name": ["name must not be empty", "name must be between 3 and 64 characters"]
  }
}
```

`FieldError { field, message }` is the atom:

```rust
pub struct FieldError { pub field: String, pub message: String }
```

## Manual validation

Validate anything that implements `Validate`:

```rust
use ferrite_framework::{Validate, ValidationErrors};

let dto: CreateUserDto = serde_json::from_str(&body)?;
if let Err(errors) = dto.validate() {
    // errors: ValidationErrors
}
```

`ValidationErrors` exposes:

- `new()`, `is_empty()`, `push()`
- `errors() -> &[FieldError]`
- `to_value()` → the JSON shape above
- `IntoResponse` → HTTP **422**

## `ValidationPipe`

For inputs that aren't a raw JSON body, use the pipe:

```rust
use ferrite_framework::{Pipe, ValidationPipe};

let pipe = ValidationPipe;
let validated = pipe.transform(raw)?;   // Err(PipeError::response(422)) on failure
```

It maps `Validate` failures to a `PipeError::response(422)` carrying `ValidationErrors`.

## Difference from NestJS `class-validator`

| | NestJS | Ferrite |
| --- | --- | --- |
| Rules | annotations + decorators | attribute macros + derive |
| Runtime | class-transformer instantiation | compile-time validation impl |
| Location | `ValidationPipe` global by default | extractor + explicit pipe |

## Next steps

- [Pipes](/docs/overview/pipes).
- [Controllers](/docs/overview/controllers).