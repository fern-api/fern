//! # UnknownAsAny SDK
//!
//! The official Rust SDK for the UnknownAsAny.
//!
//! ## Getting Started
//!
//! ```rust
//! use seed_unknown_as_any::prelude::*;
//!
//! #[tokio::main]
//! async fn main() {
//!     let config = ClientConfig {
//!         ..Default::default()
//!     };
//!     let client = UnknownAsAnyClient::new(config).expect("Failed to build client");
//!     client
//!         .unknown
//!         .post(&serde_json::json!({"key":"value"}), None)
//!         .await;
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
pub mod error;
pub mod core;
pub mod config;
pub mod client;
pub mod prelude;

pub use error::{ApiError};
pub use api::{*};
pub use core::{*};
pub use config::{*};
pub use client::{*};

