//! # OauthClientCredentials SDK
//!
//! The official Rust SDK for the OauthClientCredentials.
//!
//! ## Getting Started
//!
//! ```rust
//! use seed_oauth_client_credentials::prelude::*;
//!
//! #[tokio::main]
//! async fn main() {
//!     let config = ClientConfig {
//!         ..Default::default()
//!     };
//!     let client = OauthClientCredentialsClient::new(config).expect("Failed to build client");
//!     client
//!         .auth
//!         .get_token_with_client_credentials(
//!             &GetTokenRequest {
//!                 client_id: "my_oauth_app_123".to_string(),
//!                 client_secret: "sk_live_abcdef123456789".to_string(),
//!                 audience: "https://api.example.com".to_string(),
//!                 grant_type: "client_credentials".to_string(),
//!                 scope: Some("read:users".to_string()),
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
