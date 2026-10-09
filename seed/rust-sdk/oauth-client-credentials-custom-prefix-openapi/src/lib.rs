//! # OAuth Client Credentials OpenAPI SDK
//!
//! The official Rust SDK for the OAuth Client Credentials OpenAPI.
//!
//! ## Getting Started
//!
//! ```rust
//! use seed_api::prelude::*;
//!
//! #[tokio::main]
//! async fn main() {
//!     let config = ClientConfig {
//!         ..Default::default()
//!     };
//!     let client = ApiClient::new(config).expect("Failed to build client");
//!     client
//!         .identity
//!         .get_token(
//!             &GetTokenIdentityRequest {
//!                 username: "username".to_string(),
//!                 password: "password".to_string(),
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
pub use error::{ApiError, BuildError};
