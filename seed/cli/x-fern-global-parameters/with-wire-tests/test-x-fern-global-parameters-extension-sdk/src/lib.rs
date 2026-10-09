//! # Test x-fern-global-parameters extension SDK
//!
//! The official Rust SDK for the Test x-fern-global-parameters extension.
//!
//! ## Getting Started
//!
//! ```rust
//! use test_x_fern_global_parameters_extension_sdk::prelude::*;
//!
//! #[tokio::main]
//! async fn main() {
//!     let config = ClientConfig {
//!         ..Default::default()
//!     };
//!     let client =
//!         TestXFernGlobalParametersExtensionClient::new(config).expect("Failed to build client");
//!     client
//!         .products
//!         .search(
//!             &"regionId".to_string(),
//!             &SearchProductsRequest {
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
