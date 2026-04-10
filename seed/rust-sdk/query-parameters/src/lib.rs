//! # query-parameters SDK
//!
//! The official Rust SDK for the query-parameters.
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
//!         .user
//!         .getusername(
//!             &GetusernameQueryRequest {
//!                 limit: 1,
//!                 id: "id".to_string(),
//!                 date: NaiveDate::parse_from_str("2023-01-15", "%Y-%m-%d").unwrap(),
//!                 deadline: DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap(),
//!                 bytes: "bytes".to_string(),
//!                 user: User {
//!                     name: "name".to_string(),
//!                     tags: vec!["tags".to_string(), "tags".to_string()],
//!                     ..Default::default()
//!                 },
//!                 user_list: vec![Some(User {
//!                     name: "name".to_string(),
//!                     tags: vec!["tags".to_string(), "tags".to_string()],
//!                     ..Default::default()
//!                 })],
//!                 optional_deadline: Some(
//!                     DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap(),
//!                 ),
//!                 key_value: HashMap::from([("keyValue".to_string(), "keyValue".to_string())]),
//!                 optional_string: Some("optionalString".to_string()),
//!                 nested_user: NestedUser {
//!                     name: "name".to_string(),
//!                     user: User {
//!                         name: "name".to_string(),
//!                         tags: vec!["tags".to_string(), "tags".to_string()],
//!                         ..Default::default()
//!                     },
//!                     ..Default::default()
//!                 },
//!                 optional_user: Some(User {
//!                     name: "name".to_string(),
//!                     tags: vec!["tags".to_string(), "tags".to_string()],
//!                     ..Default::default()
//!                 }),
//!                 exclude_user: vec![Some(User {
//!                     name: "name".to_string(),
//!                     tags: vec!["tags".to_string(), "tags".to_string()],
//!                     ..Default::default()
//!                 })],
//!                 filter: vec![Some("filter".to_string())],
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
