---
title: Database (ORM)
description: Persist entities with the ORM abstraction, Repository<T>, and the in-memory and Sea adapters.
---

# Database (ORM)

Ferrite's ORM is a thin, focused abstraction: define an **entity**, pick a **store** adapter, inject a `Repository<E>`, and get CRUD. It stays deliberately small — no unit-of-work, no implicit change tracking, no relations. Everything is explicit and type-checked.

## Entities

Define an entity as a plain struct with `serde` derives:

```rust
use serde::{Deserialize, Serialize};
use ferrite_framework::entity;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[entity(table = "users", primary_key = "id")]
pub struct User {
    pub id: i64,
    pub email: String,
    pub name: String,
    pub age: i32,
}
```

The macro generates the `Entity` impl:

```rust
pub trait Entity: Clone + Send + Sync + 'static {
    type PrimaryKey: Clone + PartialEq + fmt::Debug + fmt::Display + Send + Sync + 'static;
    fn table_name() -> &'static str;
    fn primary_key(&self) -> Self::PrimaryKey;
}
```

| Option | Default | Notes |
| --- | --- | --- |
| `table` | struct name | e.g. `users` |
| `primary_key` | `"id"` | the field must exist |
| `store` | `::ferrite_framework::orm::InMemoryPick` | which picker builds the store |

## Repositories

`#[entity]` registers `Repository<E>` as a DI provider automatically:

```rust
impl<E: Entity> Repository<E> {
    pub async fn find_all(&self) -> Result<Vec<E>, OrmError>;
    pub async fn find_by_pk(&self, pk: E::PrimaryKey) -> Result<Option<E>, OrmError>;
    pub async fn save(&self, entity: &E) -> Result<(), OrmError>;
    pub async fn delete(&self, pk: &E::PrimaryKey) -> Result<bool, OrmError>;
}
```

Inject it wherever you need it:

```rust
#[injectable]
pub struct UsersService {
    users: Repository<User>,
}

impl UsersService {
    #[inject]
    pub fn new(users: Repository<User>) -> Self {
        Self { users }
    }

    pub async fn find(&self, id: i64) -> Result<Option<User>, OrmError> {
        self.users.find_by_pk(id).await
    }
}
```

### The contract

The runtime is described by two traits, so adapters are swappable:

```rust
#[async_trait]
pub trait Store<E: Entity>: Send + Sync + 'static {
    async fn find_all(&self) -> Result<Vec<E>, OrmError>;
    async fn find_by_pk(&self, pk: &str) -> Result<Option<E>, OrmError>;  // stringified key (object-safe)
    async fn save(&self, entity: &E) -> Result<(), OrmError>;
    async fn delete(&self, pk: &str) -> Result<bool, OrmError>;
}

pub trait Pick<E: Entity>: Send + Sync + 'static {
    fn build(&self) -> Arc<dyn Store<E>>;
}
```

`OrmError` has three shapes: `NotFound`, `Key(String)`, `Backend(String)`.

## The adapters

| Adapter | Crate | Status |
| --- | --- | --- |
| In-memory | `ferrite-orm` (`InMemoryPick`) | **Works** — global provider, zero setup |
| Sea | `ferrite-orm-sea` (`SeaPick`) | **Works** — full `Store` + `ModelEntity` bridge, migrations harness |
| SQLx | `ferrite-orm-sqlx` (`SqlxPick`) | **Stub** — provider registered, no `Pick<E>` impl yet |
| Diesel | `ferrite-orm-diesel` (`DieselPick`) | **Stub** — provider registered, no `Pick<E>` impl yet |

### In-memory (default)

Save an entity with `store` omitted:

```rust
#[entity]
pub struct Note { pub id: i64, pub body: String }
```

`InMemoryPick` is a global singleton, so `Repository<Note>` resolves without any module import. It's perfect for tests, prototypes, and the scaffolded examples.

### SeaORM

Pick the Sea adapter with an explicit `store`:

```rust
#[entity(table = "users", primary_key = "id", store = "ferrite_orm_sea::SeaPick")]
pub struct User { /* ... */ }
```

`SeaPick` requires `E: Entity + ModelEntity + FromQueryResult`. It validates the `DATABASE_URL` scheme and feature flags:

| Feature | Schemes |
| --- | --- |
| `sqlite` | `sqlite:`, `sqlite://` (default `sqlite::memory:`) |
| `postgres` | `postgres://`, `postgresql://` |
| `mysql` | `mysql://` |

Configure `ferrite-orm-sea` in your `Cargo.toml`:

```toml
ferrite-orm-sea = { version = "=0.1.0", features = ["postgres"] }
```

### Coming soon: SQLx & Diesel

The `SqlxPick` / `DieselPick` providers and `SqlxStore<E>` / `DieselStore<E>` constructors exist, but the `Pick<E>` / `Store<E>` impls are not wired yet. If you try to use them today you'll get a compiler error — the docs will be updated when the adapters land.

## Migrations

`ferrite-orm-sea` ships a full migrations harness driven by the CLI:

```bash
fr db migrate-create add_users_table
```

Creates `migrations/<timestamp>_add_users_table/{up.sql,down.sql}`. Then:

```bash
fr db migrate    # applies pending migrations (records in __ferrite_migrations)
fr db revert     # rolls back the last applied
fr db seed       # runs seeds/*.sql
fr db status     # applied vs pending report
```

The harness honors `FERRITE_DB_ACTION` and runs via the app binary, so your app's exact connection config drives it.

## A repository-heavy example

```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
#[entity(table = "products", primary_key = "id", store = "ferrite_orm_sea::SeaPick")]
pub struct Product { pub id: i64, pub sku: String, pub name: String }

#[controller("/products")]
pub struct ProductsController { products: Repository<Product> }

#[impl_controller]
impl ProductsController {
    #[inject]
    pub fn new(products: Repository<Product>) -> Self { Self { products } }

    #[get("/{id}")]
    pub async fn show(&self, Path(id): Path<i64>) -> Result<Json<Product>, HttpError> {
        self.products.find_by_pk(id).await
            .map_err(HttpError::internal)?
            .ok_or_else(|| HttpError::not_found("product"))
            .map(Json)
    }
}
```

## Next steps

- [Authentication (JWT)](/docs/techniques/authentication).
- [Validation](/docs/overview/validation).