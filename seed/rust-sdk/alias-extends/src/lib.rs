//! # AliasExtends SDK
//!
//! A Test Definition for extending an alias
//!
//! ## Getting Started
//!
//! ```rust
//! use seed_alias_extends::prelude::*;
//!
//! #[tokio::main]
//! async fn main() {
//!     let config = ClientConfig {
//!         ..Default::default()
//!     };
//!     let client = AliasExtendsClient::new(config).expect("Failed to build client");
//!     client
//!         .extended_inline_request_body(
//!             &InlinedChildRequest {
//!                 parent: "parent".to_string(),
//!                 child: "child".to_string(),
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
