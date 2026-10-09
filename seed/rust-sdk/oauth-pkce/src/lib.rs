//! # OauthPkce SDK
//!
//! Reproduces the OAuth authorization-code + PKCE wire-test bugs: a required literal
//! query parameter (response_type=code) that is hardcoded in the generated method, and
//! a direct optional literal query parameter (code_challenge_method=S256) that must be
//! materialized on the wire.
//!
//! ## Getting Started
//!
//! ```rust
//! use seed_oauth_pkce::prelude::*;
//!
//! #[tokio::main]
//! async fn main() {
//!     let config = ClientConfig {
//!         ..Default::default()
//!     };
//!     let client = OauthPkceClient::new(config).expect("Failed to build client");
//!     client
//!         .oauth
//!         .authorize(
//!             &AuthorizeQueryRequest {
//!                 response_type: "code".to_string(),
//!                 client_id: "client_abc123".to_string(),
//!                 redirect_uri: "https://example.com/callback".to_string(),
//!                 code_challenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM".to_string(),
//!                 code_challenge_method: Some("S256".to_string()),
//!                 scope: Some("read write".to_string()),
//!                 state: Some("xyz".to_string()),
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
