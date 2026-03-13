//! # BasicAuth SDK
//!
//! The official Rust SDK for the BasicAuth.
//!
//! ## Getting Started
//!
//! ```rust
//! use seed_basic_auth::prelude::*;
//!
//! #[tokio::main]
//! async fn main() {
//!     let config = ClientConfig {
//!         username: Some("<username>".to_string()),
//!         password: Some("<password>".to_string()),
//!         ..Default::default()
//!     };
//!     let client = BasicAuthClient::new(config).expect("Failed to build client");
//!     client.basic_auth.get_with_basic_auth(None).await;
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
pub mod error;
pub mod prelude;

pub use api::*;
pub use client::*;
pub use config::*;
pub use core::*;
pub use error::ApiError;
