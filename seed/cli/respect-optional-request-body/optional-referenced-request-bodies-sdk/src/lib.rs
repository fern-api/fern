//! # Optional referenced request bodies SDK
//!
//! The official Rust SDK for the Optional referenced request bodies.
//!
//! ## Getting Started
//!
//! ```rust
//! use optional_referenced_request_bodies_sdk::prelude::*;
//!
//! #[tokio::main]
//! async fn main() {
//!     let config = ClientConfig {
//!         ..Default::default()
//!     };
//!     let client =
//!         OptionalReferencedRequestBodiesClient::new(config).expect("Failed to build client");
//!     client
//!         .refund(
//!             &"refund-id".to_string(),
//!             &RefundRequest {
//!                 amount: Some(60.0),
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
