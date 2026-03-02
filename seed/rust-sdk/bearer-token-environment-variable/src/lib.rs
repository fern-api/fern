//! # BearerTokenEnvironmentVariable SDK
//!
//! The official Rust SDK for the BearerTokenEnvironmentVariable.
//!
//! ## Getting Started
//!
//! ```rust
//! use seed_bearer_token_environment_variable::prelude::*;
//!
//! #[tokio::main]
//! async fn main() {
//!     let config = ClientConfig {
//!         token: Some("<token>".to_string()),
//!         ..Default::default()
//!     };
//!     let client = BearerTokenEnvironmentVariableClient::new(config).expect("Failed to build client");
//!     client.service.get_with_bearer_token(None).await;
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

pub use client::*;
pub use config::*;
pub use core::*;
pub use error::ApiError;
