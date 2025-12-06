//! # ExtraProperties SDK
//!
//! The official Rust SDK for the ExtraProperties.
//!
//! ## Getting Started
//!
//! ```rust
//! use seed_extra_properties::prelude::*;
//!
//! #[tokio::main]
//! async fn main() {
//!     let config = ClientConfig {
//!         ..Default::default()
//!     };
//!     let client = ExtraPropertiesClient::new(config).expect("Failed to build client");
//!     client
//!         .user
//!         .create_user(
//!             &CreateUserRequest {
//!                 name: "Alice".to_string(),
//!                 r#type: "CreateUserRequest".to_string(),
//!                 version: "v1".to_string(),
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

pub use api::*;
pub use client::*;
pub use config::*;
pub use core::*;
pub use error::ApiError;
