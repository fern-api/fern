//! # RequestParameters SDK
//!
//! The official Rust SDK for the RequestParameters.
//!
//! ## Getting Started
//!
//! ```rust
//! use seed_request_parameters::prelude::*;
//!
//! #[tokio::main]
//! async fn main() {
//!     let config = ClientConfig {
//!         ..Default::default()
//!     };
//!     let client = RequestParametersClient::new(config).expect("Failed to build client");
//!     client
//!         .user
//!         .create_username(
//!             &CreateUsernameRequest {
//!                 tags: vec!["tags".to_string(), "tags".to_string()],
//!                 username: "username".to_string(),
//!                 password: "password".to_string(),
//!                 name: "test".to_string(),
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
