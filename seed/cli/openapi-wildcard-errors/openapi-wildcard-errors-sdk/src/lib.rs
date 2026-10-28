//! # openapi-wildcard-errors SDK
//!
//! The official Rust SDK for the openapi-wildcard-errors.
//!
//! ## Getting Started
//!
//! ```rust
//! use openapi_wildcard_errors_sdk::prelude::*;
//!
//! #[tokio::main]
//! async fn main() {
//!     let config = ClientConfig {
//!         ..Default::default()
//!     };
//!     let client = OpenapiWildcardErrorsClient::new(config).expect("Failed to build client");
//!     client
//!         .items
//!         .create_item(
//!             &CreateItemRequest {
//!                 name: "name".to_string(),
//!             },
//!             None,
//!         )
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
pub mod environment;
pub mod error;
pub mod prelude;

pub use client::*;
pub use config::*;
pub use core::*;
pub use environment::*;
pub use error::{ApiError, BuildError};
