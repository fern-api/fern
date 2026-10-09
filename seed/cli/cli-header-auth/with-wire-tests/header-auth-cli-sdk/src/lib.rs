//! # Header Auth CLI SDK
//!
//! The official Rust SDK for the Header Auth CLI.
//!
//! ## Getting Started
//!
//! ```rust
//! use header_auth_cli_sdk::prelude::*;
//!
//! #[tokio::main]
//! async fn main() {
//!     let config = ClientConfig {
//!         api_key: Some("<value>".to_string()),
//!         ..Default::default()
//!     };
//!     let client = HeaderAuthCliClient::new(config).expect("Failed to build client");
//!     client.widgets.list(None).await;
//! }
//! ```
//!
//! ## Modules
//!
//! - [`api`] - Core API types and models
//! - [`client`] - Client implementations
//! - [`config`] - Configuration options
//! - [`core`] - Core utilities and infrastructure
//! - [`error`] - Error types and handling
//! - [`prelude`] - Common imports for convenience

pub mod api;
pub mod client;
pub mod config;
pub mod core;
pub mod environment;
pub mod error;
pub mod prelude;

pub use client::*;
pub use config::*;
pub use core::*;
pub use environment::*;
pub use error::{ApiError, BuildError};
