//! # InferredAuthExplicit SDK
//!
//! The official Rust SDK for the InferredAuthExplicit.
//!
//! ## Getting Started
//!
//! ```rust
//! use seed_inferred_auth_explicit::prelude::*;
//!
//! #[tokio::main]
//! async fn main() {
//!     let config = ClientConfig {
//!         ..Default::default()
//!     };
//!     let client = InferredAuthExplicitClient::new(config).expect("Failed to build client");
//!     client
//!         .auth
//!         .get_token_with_client_credentials(
//!             &GetTokenRequest {
//!                 client_id: "client_id".to_string(),
//!                 client_secret: "client_secret".to_string(),
//!                 audience: "https://api.example.com".to_string(),
//!                 grant_type: "client_credentials".to_string(),
//!                 scope: Some("scope".to_string()),
//!             },
//!             Some(RequestOptions::new().additional_header("X-Api-Key", "X-Api-Key".to_string())),
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
