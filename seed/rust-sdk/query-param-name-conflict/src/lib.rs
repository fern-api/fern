//! # Query Param Name Conflict API SDK
//!
//! The official Rust SDK for the Query Param Name Conflict API.
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
//!         .bulk_update_tasks(
//!             &BulkUpdateTasksRequest {
//!                 filter_assigned_to: None,
//!                 filter_is_complete: None,
//!                 filter_date: None,
//!                 fields: None,
//!                 bulk_update_tasks_request_assigned_to: None,
//!                 bulk_update_tasks_request_date: None,
//!                 bulk_update_tasks_request_is_complete: None,
//!                 text: None,
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
