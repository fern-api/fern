//! # PathParameters SDK
//!
//! The official Rust SDK for the PathParameters.
//!
//! ## Getting Started
//!
//! ```rust
//! use seed_path_parameters::prelude::*;
//!
//! #[tokio::main]
//! async fn main() {
//!     let config = ClientConfig {
//!         ..Default::default()
//!     };
//!     let client = PathParametersClient::new(config).expect("Failed to build client");
//!     client
//!         .organizations
//!         .get_organization(
//!             &"tenant_id".to_string(),
//!             &"organization_id".to_string(),
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
