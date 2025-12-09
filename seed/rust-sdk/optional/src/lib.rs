//! # ObjectsWithImports SDK
//!
//! The official Rust SDK for the ObjectsWithImports.
//!
//! ## Getting Started
//!
//! ```rust
//! use seed_objects_with_imports::prelude::*;
//!
//! #[tokio::main]
//! async fn main() {
//!     let config = ClientConfig {
//!         ..Default::default()
//!     };
//!     let client = ObjectsWithImportsClient::new(config).expect("Failed to build client");
//!     client
//!         .optional
//!         .send_optional_body(
//!             &Some(HashMap::from([(
//!                 "string".to_string(),
//!                 serde_json::json!({"key":"value"}),
//!             )])),
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
