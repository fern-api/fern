//! # Query Parameters API SDK
//!
//! The official Rust SDK for the Query Parameters API.
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
//!         .search(
//!             &SearchQueryRequest {
//!                 limit: 1,
//!                 id: "id".to_string(),
//!                 date: "date".to_string(),
//!                 deadline: DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z")
//!                     .unwrap()
//!                     .with_timezone(&Utc),
//!                 bytes: "bytes".to_string(),
//!                 user: User {
//!                     name: Some("name".to_string()),
//!                     tags: Some(vec!["tags".to_string(), "tags".to_string()]),
//!                 },
//!                 user_list: vec![Some(User {
//!                     name: Some("name".to_string()),
//!                     tags: Some(vec!["tags".to_string(), "tags".to_string()]),
//!                 })],
//!                 optional_deadline: Some(
//!                     DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z")
//!                         .unwrap()
//!                         .with_timezone(&Utc),
//!                 ),
//!                 key_value: Some(HashMap::from([(
//!                     "keyValue".to_string(),
//!                     Some("keyValue".to_string()),
//!                 )])),
//!                 optional_string: Some("optionalString".to_string()),
//!                 nested_user: Some(NestedUser {
//!                     name: Some("name".to_string()),
//!                     user: Some(User {
//!                         name: Some("name".to_string()),
//!                         tags: Some(vec!["tags".to_string(), "tags".to_string()]),
//!                     }),
//!                 }),
//!                 optional_user: Some(User {
//!                     name: Some("name".to_string()),
//!                     tags: Some(vec!["tags".to_string(), "tags".to_string()]),
//!                 }),
//!                 exclude_user: vec![Some(User {
//!                     name: Some("name".to_string()),
//!                     tags: Some(vec!["tags".to_string(), "tags".to_string()]),
//!                 })],
//!                 filter: vec![Some("filter".to_string())],
//!                 neighbor: Some(User {
//!                     name: Some("name".to_string()),
//!                     tags: Some(vec!["tags".to_string(), "tags".to_string()]),
//!                 }),
//!                 neighbor_required: SearchRequestNeighborRequired::User(User {
//!                     name: Some("name".to_string()),
//!                     tags: Some(vec!["tags".to_string(), "tags".to_string()]),
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
