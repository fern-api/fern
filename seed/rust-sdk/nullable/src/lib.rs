//! # Nullable SDK
//!
//! The official Rust SDK for the Nullable.
//!
//! ## Getting Started
//!
//! ```rust
//! use seed_nullable::prelude::*;
//!
//! #[tokio::main]
//! async fn main() {
//!     let config = ClientConfig {
//!         ..Default::default()
//!     };
//!     let client = NullableClient::new(config).expect("Failed to build client");
//!     client
//!         .nullable
//!         .get_users(
//!             &GetUsersQueryRequest {
//!                 usernames: vec![Some("usernames".to_string())],
//!                 avatar: Some("avatar".to_string()),
//!                 activated: vec![Some(true)],
//!                 tags: vec![Some(Some("tags".to_string()))],
//!                 extra: Some(Some(true)),
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
pub mod error;
pub mod core;
pub mod config;
pub mod client;
pub mod prelude;

pub use error::{ApiError};
pub use api::{*};
pub use core::{*};
pub use config::{*};
pub use client::{*};

