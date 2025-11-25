//! # ApiWideBasePath SDK
//!
//! The official Rust SDK for the ApiWideBasePath.
//!
//! ## Getting Started
//!
//! ```rust
//! use seed_api_wide_base_path::prelude::*;
//!
//! #[tokio::main]
//! async fn main() {
//!     let config = ClientConfig {
//!         ..Default::default()
//!     };
//!     let client = ApiWideBasePathClient::new(config).expect("Failed to build client");
//!     client
//!         .service
//!         .post(
//!             &"pathParam".to_string(),
//!             &"serviceParam".to_string(),
//!             &1,
//!             &"resourceParam".to_string(),
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
pub use error::ApiError;
