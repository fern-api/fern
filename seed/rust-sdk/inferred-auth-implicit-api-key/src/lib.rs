//! # InferredAuthImplicitApiKey SDK
//!
//! The official Rust SDK for the InferredAuthImplicitApiKey.
//!
//! ## Getting Started
//!
//! ```rust
//! use seed_inferred_auth_implicit_api_key::prelude::*;
//!
//! #[tokio::main]
//! async fn main() {
//!     let config = ClientConfig {
//!         ..Default::default()
//!     };
//!     let client = InferredAuthImplicitApiKeyClient::new(config).expect("Failed to build client");
//!     client
//!         .auth
//!         .get_token(Some(
//!             RequestOptions::new().additional_header("X-Api-Key", "api_key"),
//!         ))
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
