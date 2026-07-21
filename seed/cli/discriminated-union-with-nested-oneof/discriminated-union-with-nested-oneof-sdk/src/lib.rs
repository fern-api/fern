//! # Discriminated Union with Nested OneOf SDK
//!
//! The official Rust SDK for the Discriminated Union with Nested OneOf.
//!
//! ## Getting Started
//!
//! ```rust
//! use discriminated_union_with_nested_oneof_sdk::prelude::*;
//!
//! #[tokio::main]
//! async fn main() {
//!     let config = ClientConfig {
//!         ..Default::default()
//!     };
//!     let client =
//!         DiscriminatedUnionWithNestedOneofClient::new(config).expect("Failed to build client");
//!     client
//!         .create_ast(
//!             &AstNode::Llm {
//!                 data: AstNodeLlm {
//!                     model: "model".to_string(),
//!                     ..Default::default()
//!                 },
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

pub use client::*;
pub use config::*;
pub use core::*;
pub use error::{ApiError, BuildError};
