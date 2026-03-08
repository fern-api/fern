//! # Exhaustive SDK
//!
//! The official Rust SDK for the Exhaustive.
//!
//! ## Getting Started
//!
//! ```rust
//! use seed_exhaustive::prelude::*;
//!
//! #[tokio::main]
//! async fn main() {
//!     let config = ClientConfig {
//!         token: Some("<token>".to_string()),
//!         ..Default::default()
//!     };
//!     let client = ExhaustiveClient::new(config).expect("Failed to build client");
//!     client
//!         .endpoints
//!         .container
//!         .get_and_return_list_of_primitives(&vec!["string".to_string(), "string".to_string()], None)
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
