//! # MultiUrlEnvironment SDK
//!
//! The official Rust SDK for the MultiUrlEnvironment.
//!
//! ## Getting Started
//!
//! ```rust
//! use seed_multi_url_environment::prelude::*;
//!
//! #[tokio::main]
//! async fn main() {
//!     let config = ClientConfig {
//!         token: Some("<token>".to_string()),
//!         ..Default::default()
//!     };
//!     let client = MultiUrlEnvironmentClient::new(config).expect("Failed to build client");
//!     client
//!         .ec_2
//!         .boot_instance(
//!             &BootInstanceRequest {
//!                 size: "size".to_string(),
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

pub use api::*;
pub use client::*;
pub use config::*;
pub use core::*;
pub use environment::*;
pub use error::ApiError;
