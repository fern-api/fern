//! # UnionQueryParameters SDK
//!
//! The official Rust SDK for the UnionQueryParameters.
//!
//! ## Getting Started
//!
//! ```rust
//! use seed_union_query_parameters::prelude::*;
//!
//! #[tokio::main]
//! async fn main() {
//!     let config = ClientConfig {
//!         ..Default::default()
//!     };
//!     let client = UnionQueryParametersClient::new(config).expect("Failed to build client");
//!     client
//!         .events
//!         .subscribe(
//!             &SubscribeQueryRequest {
//!                 event_type: Some(EventTypeParam::EventTypeEnum(EventTypeEnum::GroupCreated)),
//!                 tags: Some(StringOrListParam::String("tags".to_string())),
//!                 ..Default::default()
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
