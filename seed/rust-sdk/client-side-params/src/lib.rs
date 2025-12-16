//! # ClientSideParams SDK
//!
//! The official Rust SDK for the ClientSideParams.
//!
//! ## Getting Started
//!
//! ```rust
//! use seed_client_side_params::prelude::*;
//!
//! #[tokio::main]
//! async fn main() {
//!     let config = ClientConfig {
//!         token: Some("<token>".to_string()),
//!         ..Default::default()
//!     };
//!     let client = ClientSideParamsClient::new(config).expect("Failed to build client");
//!     client
//!         .service
//!         .list_resources(
//!             &ListResourcesQueryRequest {
//!                 page: 1,
//!                 per_page: 1,
//!                 sort: "created_at".to_string(),
//!                 order: "desc".to_string(),
//!                 include_totals: true,
//!                 fields: Some("fields".to_string()),
//!                 search: Some("search".to_string()),
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
