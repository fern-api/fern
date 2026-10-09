//! # Multi Content Type Examples SDK
//!
//! The official Rust SDK for the Multi Content Type Examples.
//!
//! ## Getting Started
//!
//! ```rust
//! use multi_content_type_examples_sdk::prelude::*;
//!
//! #[tokio::main]
//! async fn main() {
//!     let config = ClientConfig {
//!         ..Default::default()
//!     };
//!     let client = MultiContentTypeExamplesClient::new(config).expect("Failed to build client");
//!     client
//!         .clients
//!         .create(
//!             &ClientRequest {
//!                 client: Some(Client {
//!                     name: "Acme Corp".to_string(),
//!                     email: "contact@acme.com".to_string(),
//!                     ..Default::default()
//!                 }),
//!                 ..Default::default()
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

pub use client::*;
pub use config::*;
pub use core::*;
pub use error::{ApiError, BuildError};
