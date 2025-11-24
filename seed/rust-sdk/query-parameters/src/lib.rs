//! # QueryParameters SDK
//!
//! The official Rust SDK for the QueryParameters.
//!
//! ## Getting Started
//!
//! ```rust
//! use seed_query_parameters::prelude::*;
//!
//! #[tokio::main]
//! async fn main() {
//!     let config = ClientConfig {
//!         ..Default::default()
//!     };
//!     let client = QueryParametersClient::new(config).expect("Failed to build client");
//!     client
//!         .user
//!         .get_username(
//!             &GetUsernameQueryRequest {
//!                 limit: 1,
//!                 id: Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap(),
//!                 date: NaiveDate::parse_from_str("2023-01-15", "%Y-%m-%d").unwrap(),
//!                 deadline: DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z")
//!                     .unwrap()
//!                     .with_timezone(&Utc),
//!                 bytes: "SGVsbG8gd29ybGQh".to_string(),
//!                 user: User {
//!                     name: "name".to_string(),
//!                     tags: vec!["tags".to_string(), "tags".to_string()],
//!                 },
//!                 user_list: vec![
//!                     User {
//!                         name: "name".to_string(),
//!                         tags: vec!["tags".to_string(), "tags".to_string()],
//!                     },
//!                     User {
//!                         name: "name".to_string(),
//!                         tags: vec!["tags".to_string(), "tags".to_string()],
//!                     },
//!                 ],
//!                 optional_deadline: Some(
//!                     DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z")
//!                         .unwrap()
//!                         .with_timezone(&Utc),
//!                 ),
//!                 key_value: HashMap::from([("keyValue".to_string(), "keyValue".to_string())]),
//!                 optional_string: Some("optionalString".to_string()),
//!                 nested_user: NestedUser {
//!                     name: "name".to_string(),
//!                     user: User {
//!                         name: "name".to_string(),
//!                         tags: vec!["tags".to_string(), "tags".to_string()],
//!                     },
//!                 },
//!                 optional_user: Some(User {
//!                     name: "name".to_string(),
//!                     tags: vec!["tags".to_string(), "tags".to_string()],
//!                 }),
//!                 exclude_user: vec![User {
//!                     name: "name".to_string(),
//!                     tags: vec!["tags".to_string(), "tags".to_string()],
//!                 }],
//!                 filter: vec!["filter".to_string()],
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
