//! # Literal SDK
//!
//! Test definition for literal schemas.
//!
//! ## Getting Started
//!
//! ```rust
//! use seed_literal::prelude::*;
//!
//! #[tokio::main]
//! async fn main() {
//!     let config = ClientConfig {
//!         ..Default::default()
//!     };
//!     let client = LiteralClient::new(config).expect("Failed to build client");
//!     client
//!         .headers
//!         .send(
//!             &SendLiteralsInHeadersRequest {
//!                 endpoint_version: "02-12-2024".to_string(),
//!                 r#async: true,
//!                 query: "What is the weather today".to_string(),
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
pub mod error;
pub mod prelude;

pub use api::*;
pub use client::*;
pub use config::*;
pub use core::*;
pub use error::ApiError;
