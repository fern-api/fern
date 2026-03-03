//! # Pagination SDK
//!
//! The official Rust SDK for the Pagination.
//!
//! ## Getting Started
//!
//! ```rust
//! use seed_pagination::prelude::*;
//!
//! #[tokio::main]
//! async fn main() {
//!     let config = ClientConfig {
//!         token: Some("<token>".to_string()),
//!         ..Default::default()
//!     };
//!     let client = PaginationClient::new(config).expect("Failed to build client");
//!     client
//!         .complex
//!         .search(
//!             &"index".to_string(),
//!             &SearchRequest {
//!                 pagination: Some(StartingAfterPaging {
//!                     per_page: 1,
//!                     starting_after: Some("starting_after".to_string()),
//!                 }),
//!                 query: SearchRequestQuery::SingleFilterSearchRequest(SingleFilterSearchRequest {
//!                     field: Some("field".to_string()),
//!                     operator: Some(SingleFilterSearchRequestOperator::Equals),
//!                     value: Some("value".to_string()),
//!                 }),
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
