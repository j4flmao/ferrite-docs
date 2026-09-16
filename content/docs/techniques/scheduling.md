---
title: Scheduling
description: Run recurring jobs on cron schedules with CronJob and keep schedules configurable with CronTicker.
---

# Scheduling

`ferrite-scheduler` adds cron-based scheduling in the NestJS `@Cron`/`CronJob` style: declare schedules in your provider with attribute macros, and the module starts a `CronTicker` that ticks over a `cron` schedule.

## Enable it

```cargo
fr add scheduler
```

```rust
#[module(imports = [CronModuleImpl])]
pub struct AppModule;
```

## Scheduled functions

```rust
use ferrite_scheduler::cron;
use ferrite_framework::injectable;

#[injectable]
pub struct DailyDigestService; // or with #[inject] constructor + deps

impl DailyDigestService {
    #[cron("0 8 * * *", name = "daily_digest")]
    pub async fn run(&self) {
        build_and_send_digest().await;
    }
}
```

### `#[cron]` options

| Option | Default | Purpose |
| --- | --- | --- |
| (positional) | required | A `cron` crate schedule string |
| `name` | fn name | Identifier for the job |
| `schedule` | – | Same as positional; for codegen-referenced schedules |
| `config_path` | – | Read the schedule from config at runtime (see below) |
| `run_on_start` | `false` | Fire once when the ticker starts |

## CronTicker

`CronTicker` is an injectable that owns the ticking loop. **Construct it in your module with your provider** so dependencies resolve under DI:

```rust
#[injectable]
pub struct CronTicker {
    // holds a loop that reads the job registry
}
```

```rust
#[module(imports = [CronModuleImpl])]
pub struct AppModule;
```

`CronModuleImpl::on_application_bootstrap` starts the ticker, so schedules begin firing when the app is ready.

## Schedules from config

Keeping schedules in env/config is supported two ways — via `config_path` on the attribute, or by choosing a schedule expression directly when the module reads `CRON_TICKER_*` env vars:

| Env | Default | Purpose |
| --- | --- | --- |
| `CLOCK_DEFAULT_SCHEDULE` | `*/15 * * * * * *` | Fallback schedule |
| `CLOCK_TIMEZONE` | `utc` | Ticker timezone |

Using `config_path = "cron.daily_digest"` reads the schedule from your app config (see [Configuration](/docs/overview/configuration)) instead of hardcoding.

## Error handling

A job returning an error logs it and the ticker continues; `CronJob` and `cron::Schedule` failures surface via `CronError`.

## Next steps

- [Background jobs](/docs/techniques/background-jobs).
- [Lifecycle events](/docs/fundamentals/lifecycle-events).