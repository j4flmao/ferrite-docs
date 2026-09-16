---
title: OAuth2 & OIDC
description: Add social login with Google, GitHub and Discord using ferrite-auth-oauth.
---

# OAuth2 & OIDC

`ferrite-auth-oauth` wires the full OAuth2 authorization-code flow for **Google**, **GitHub**, and **Discord** — including CSRF-protected state, token exchange, userinfo parsing, and JWT minting that is compatible with `ferrite-auth-jwt`.

## Enable it

```cargo
fr add auth-oauth
```

```rust
#[module(imports = [OAuthModule])]
pub struct AppModule;
```

## Provider configuration

Create an OAuth app per provider and set these env vars:

| Provider | Vars |
| --- | --- |
| Google | `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_OAUTH_REDIRECT_URI` |
| GitHub | `GITHUB_OAUTH_CLIENT_ID`, `GITHUB_OAUTH_CLIENT_SECRET`, `GITHUB_OAUTH_REDIRECT_URI` |
| Discord | `DISCORD_OAUTH_CLIENT_ID`, `DISCORD_OAUTH_CLIENT_SECRET`, `DISCORD_OAUTH_REDIRECT_URI` |

Optional: `OAUTH_CLIENT_SUCCESS_URL` redirects the browser after login.

## Routes

The module mounts two routes per provider:

| Route | Purpose |
| --- | --- |
| `GET /oauth/{provider}/authorize` | Redirects the user to the provider's consent screen |
| `GET /oauth/{provider}/callback` | Exchanges the code, returns `OAuthUser`, optionally redirects |

```rust
use ferrite_auth_oauth::OAuthProvider;

OAuthProvider::Google   // "google"
OAuthProvider::Github   // "github"
OAuthProvider::Discord  // "discord"
```

`OAuthProvider` implements `Display`, `FromStr`, and lowercase serde.

## `OAuthService`

```rust
use ferrite_auth_oauth::{OAuthProvider, OAuthService};

#[injectable]
pub struct AuthController {
    oauth: OAuthService,
}

impl AuthController {
    #[inject]
    pub fn new(oauth: OAuthService) -> Self {
        Self { oauth }
    }

    pub async fn start(&self, provider: OAuthProvider) -> Result<String, crate::Error> {
        Ok(self.oauth.authorize_url(provider)?)
    }
}
```

| Method | Returns |
| --- | --- |
| `provider_config(provider)` | The resolved `ProviderConfig` |
| `authorize_url(provider)` | The consent-screen URL (CSRF state embedded) |
| `callback(provider, code, state, error)` | `OAuthUser` after exchanging the code |
| `sign_jwt(&OAuthUser)` | A Ferrite-JWT-compatible HS256 token |

The callback validates the signed state (HMAC-SHA256 over a random nonce; secret from `JWT_SECRET` or `OAUTH_STATE_SECRET`) — protecting against login CSRF.

## `OAuthUser`

```rust
pub struct OAuthUser {
    pub id: String,
    pub email: String,
    pub name: String,
    pub avatar_url: String,
    pub provider: OAuthProvider,
}
```

## JWT hand-off

Because the tokens are HS256-compatible with `ferrite-auth-jwt`, you can sign a session token and pass it through:

```rust
let user = oauth.callback(provider, code, state, error)?;
let token = oauth.sign_jwt(&user)?;
// redirect the browser with token=...
```

The `sub` claim maps to the OAuth user id (`String` → serialized), and `email` is the user's email.

## `OAuthError`

Distinct variants keep failure modes debug-friendly: `UnknownProvider`, `MissingConfig{prefix}`, `StateSign`, `InvalidState`, `Http`, `ProviderStatus`, `Decode`, `Authorization`, `Jwt`.

## Next steps

- [Authentication (JWT)](/docs/techniques/authentication).
- [Configuration](/docs/overview/configuration).