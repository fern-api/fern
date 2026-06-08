//! Library entrypoint, used by integration tests and (potentially) future
//! consumers that want to embed the dispatcher.

pub mod cli;
pub mod commands;
pub mod delegate;
pub mod dispatch;
pub mod embed;
pub mod runtime;

/// Reported by `fern --version`. This is the version of the Rust dispatcher;
/// the bundled fern-ts has its own version (`fern ts-version` — not yet
/// implemented). Once the dispatcher is the source of truth, the two will
/// merge.
pub const VERSION: &str = env!("CARGO_PKG_VERSION");
