---
title: Authentication (JWT)
description: Issue and verify HS256 JWTs with JwtService, protect routes with AuthGuard, and read the current user.
---

# Authentication (JWT)

`ferrite-auth-jwt` provides HS256 JWT sign/verify, a route guard, and a `CurrentUser` extractor — zero external services required.

## Enable it

```cargo
fr add auth-jwt
```

```rust
#[module(imports = [AuthModule])]
pub struct AppModule;
```

## Configuration

| Env | Default | Purpose |
| --- | --- | --- |
| `JWT_SECRET` | `ferrite-dev-secret-change-me` | HMAC key |
| `JWT_EXPIRES_IN` | `86400` (seconds) | Token TTL |

Always set `JWT_SECRET` in production — `fr doctor` and the crate help you catch misses.

## `JwtService`

```rust
use ferrite_auth_jwt::JwtService;

#[injectable]
pub struct AuthService {
    jwt: JwtService,
}

impl AuthService {
    #[inject]
    pub fn new(jwt: JwtService) -> Self {
        Self { jwt }
    }

    pub async fn login(&self, user_id: i64, email: &str) -> Result<String, crate::Error> {
        Ok(self.jwt.sign(user_id, email)?)
    }
}
```

| Method | Returns |
| --- | --- |
| `sign(sub: i64, email: &str) -> Result<String, JwtError>` | `"eyJ...` |
| `verify(token) -> Result<JwtClaims, JwtError>` | Decoded claims |
| `secret() -> String` | Effective secret |
| `default_ttl_secs() -> u64` | Effective TTL |
| `header() -> &'static Header` | Bearer header value |

### Claims

```rust
pub struct JwtClaims {
    pub sub: i64,          // subject (user id)
    pub email: String,
    pub exp: usize,        // expiry (unix seconds)
    pub iss: Option<String>, // issuer (optional)
}
```

`JwtError` distinguishes `MissingSecret`, `InvalidToken(String)`, `MissingBearer`, and `MalformedHeader` — the message includes `missing JWT_SECRET env variable` when relevant.

## Protecting routes with `AuthGuard`

```rust
use ferrite_auth_jwt::AuthGuard;

#[impl_controller]
#[use_guards(AuthGuard)]
impl UsersController {
    #[get("/me")]
    pub async fn me(&self, CurrentUser(claims): CurrentUser) -> Result<Json<User>, HttpError> {
        // claims: JwtClaims — already verified
        Ok(Json(self.service.find(claims.sub).await?))
    }
}
```

`AuthGuard` verifies the `Authorization: Bearer <token>` header in `can_activate`. It also exposes `extract_bearer(ctx: &RequestCtx) -> Result<String, JwtError>` if you need the raw token.

## Reading the current user

`CurrentUser(pub JwtClaims)` is an Axum `FromRequestParts` extractor — it takes the bearer token, verifies it, and rejects with a `401` if absent or invalid:

```rust
pub async fn me(&self, CurrentUser(claims): CurrentUser) -> String {
    format!("Hello {}", claims.email)
}
```

## A login endpoint

```rust
#[controller("/auth")]
pub struct AuthController { auth: AuthService }

#[impl_controller]
impl AuthController {
    #[inject]
    pub fn new(auth: AuthService) -> Self { Self { auth } }

    #[post("/login")]
    pub async fn login(&self, Json(dto): Json<LoginDto>) -> Result<Json<TokenResponse>, HttpError> {
        let user = self.auth.validate(&dto).await?;
        let token = self.auth.login(user.id, &user.email)
            .map_err(|_| HttpError::unauthorized("cannot issue token"))?;
        Ok(Json(TokenResponse { token }))
    }
}
```

## Notes

- There is **no** `JwtAuthGuard` type — the guard is `AuthGuard`.
- Guard metadata flows into the OpenAPI spec automatically: guarded routes get a `401` response and the `bearer` security scheme (see [OpenAPI & Swagger](/docs/fundamentals/openapi-swagger)).

## Next steps

- [OAuth2 & OIDC](/docs/techniques/oauth2-oidc) — social login that mints the same JWT flavor.
- [Guards](/docs/overview/guards).