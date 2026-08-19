//! # openapi-request-body-ref SDK
//!
//! The official Rust SDK for the openapi-request-body-ref.
//!
//! ## Getting Started
//!
//! ```rust
//! use openapi_request_body_ref_sdk::prelude::*;
//!
//! #[tokio::main]
//! async fn main() {
//!     let config = ClientConfig {
//!         ..Default::default()
//!     };
//!     let client = OpenapiRequestBodyRefClient::new(config).expect("Failed to build client");
//!     client
//!         .vendor
//!         .update_vendor(
//!             &"vendor_id".to_string(),
//!             &UpdateVendorRequest {
//!                 name: "name".to_string(),
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
