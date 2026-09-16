---
title: Pipes
description: Transform and validate handler inputs with the Pipe trait, ParseIntPipe and DefaultValuePipe.
---

# Pipes

Pipes run just before the handler and **transform or validate** the inputs it receives. A pipe takes a value of one type, transforms it, and either returns a new value or aborts with a `PipeError`.

## The `Pipe` trait

```rust
pub trait Pipe<Input> {
    type Output;

    fn transform(&self, value: Input) -> Result<Self::Output, PipeError>;
}
```

## Built-in pipes

### `ParseIntPipe`

Parses a `String` into an `i64`:

```rust
use ferrite_framework::Pipe;

let pipe = ParseIntPipe;
let n: i64 = pipe.transform("42".to_string())?;   // Ok(42)
pipe.transform("abc".to_string())                 // Err(PipeError)
```

Use it in error paths instead of manual `.parse().map_err(...)`:

```rust
use ferrite_framework::{HttpError, Pipe, ParseIntPipe};

let id = ParseIntPipe
    .transform(raw_id)
    .map_err(|_| HttpError::bad_request("id must be an integer"))?;
```

### `DefaultValuePipe`

Returns a default string when the input is empty:

```rust
use ferrite_framework::{Pipe, DefaultValuePipe};

let pipe = DefaultValuePipe("development".to_string());
let env = pipe.transform("".to_string())?;   // "development"
let env = pipe.transform("prod".to_string())?; // "prod"
```

## Custom pipes

Implement the trait on any value:

```rust
use ferrite_framework::{Pipe, PipeError};

pub struct SlugPipe;

impl Pipe<String> for SlugPipe {
    type Output = String;

    fn transform(&self, value: String) -> Result<Self::Output, PipeError> {
        if value.trim().is_empty() {
            return Err(PipeError::bad_request("slug must not be empty"));
        }
        Ok(value.trim().to_lowercase().replace(' ', "-"))
    }
}
```

### `PipeError`

```rust
let err = PipeError::new("message");
let err = PipeError::response(response);  // wrap an arbitrary Response
let err = PipeError::bad_request("..."):  // shorthand constructors
let err = PipeError::forbidden("...");
let err = PipeError::not_found("...");
```

`PipeError::bad_request` renders as a 400; `PipeError::response` lets you short-circuit with a fully-formed response.

## Validation pipes

The validation crate ships `ValidationPipe<Rhs?>` ([source](/docs/overview/validation)): it runs `Validate` on the value and maps errors to a `PipeError::response(422)` carrying `ValidationErrors`. It integrates with the validating `ferrite_framework::Json<T>` extractor, which validates automatically on deserialization.

## Pipeline position

```text
Middleware → Guards → Interceptors(before) → Pipes → Handler
```

A pipe failure aborts the pipeline and (if applicable) passes through registered exception filters.

## Next steps

- [Validation](/docs/overview/validation).
- [Exception filters](/docs/overview/exception-filters).