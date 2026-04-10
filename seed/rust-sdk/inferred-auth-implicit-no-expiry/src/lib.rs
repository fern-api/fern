//! # inferred-auth-implicit-no-expiry SDK
//!
//! The official Rust SDK for the inferred-auth-implicit-no-expiry.
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
//!         .auth
//!         .gettokenwithclientcredentials(
//!             &AuthGetTokenWithClientCredentialsRequest {
//!                 client_id: "client_id".to_string(),
//!                 client_secret: "client_secret".to_string(),
//!                 audience: AuthGetTokenWithClientCredentialsRequestAudience::HttpsApiExampleCom,
//!                 grant_type: AuthGetTokenWithClientCredentialsRequestGrantType::ClientCredentials,
//!                 scope: None,
//!             },
//!             Some(RequestOptions::new().additional_header("X-Api-Key", "X-Api-Key")),
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
