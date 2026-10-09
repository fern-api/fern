//! # api-wide-base-path-with-default SDK
//!
//! The official Rust SDK for the api-wide-base-path-with-default.
//!
//! ## Getting Started
//!
//! ```rust
//! use api_wide_base_path_with_default_sdk::prelude::*;
//!
//! #[tokio::main]
//! async fn main() {
//!     let config = ClientConfig {
//!         ..Default::default()
//!     };
//!     let client = ApiWideBasePathWithDefaultClient::new(config).expect("Failed to build client");
//!     client
//!         .widgets
//!         .create(
//!             &"v1beta".to_string(),
//!             &Widget {
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
