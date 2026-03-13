//! # OauthClientCredentialsDefault SDK
//!
//! The official Rust SDK for the OauthClientCredentialsDefault.
//!
//! ## Getting Started
//!
//! ```rust
//! use seed_oauth_client_credentials_default::prelude::*;
//!
//! #[tokio::main]
//! async fn main() {
//!     let config = ClientConfig {
//!         ..Default::default()
//!     };
//!     let client = OauthClientCredentialsDefaultClient::new(config).expect("Failed to build client");
//!     client
//!         .auth
//!         .get_token(
//!             &GetTokenRequest {
//!                 client_id: "client_id".to_string(),
//!                 client_secret: "client_secret".to_string(),
//!                 grant_type: "client_credentials".to_string(),
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
