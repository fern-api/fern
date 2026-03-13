//! # Audiences API SDK
//!
//! The official Rust SDK for the Audiences API.
//!
//! ## Getting Started
//!
//! ```rust
//! use seed_audiences::prelude::*;
//!
//! #[tokio::main]
//! async fn main() {
//!     let config = ClientConfig {
//!         ..Default::default()
//!     };
//!     let client = AudiencesClient::new(config).expect("Failed to build client");
//!     client
//!         .folder_a
//!         .service
//!         .get_direct_thread(
//!             &GetDirectThreadQueryRequest {
//!                 ids: vec!["ids".to_string()],
//!                 tags: vec!["tags".to_string()],
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
pub mod environment;
pub mod error;
pub mod prelude;

pub use api::*;
pub use client::*;
pub use config::*;
pub use core::*;
pub use environment::*;
pub use error::ApiError;
