//! # Nested Component Refs SDK
//!
//! The official Rust SDK for the Nested Component Refs.
//!
//! ## Getting Started
//!
//! ```rust
//! use nested_refs_cli_sdk::prelude::*;
//!
//! #[tokio::main]
//! async fn main() {
//!     let config = ClientConfig {
//!         ..Default::default()
//!     };
//!     let client = NestedRefsCliClient::new(config).expect("Failed to build client");
//!     client
//!         .orders
//!         .create(
//!             &CreateOrdersRequest {
//!                 customer_id: "customerId".to_string(),
//!                 ship_to: CreateOrdersRequestShipTo {
//!                     line1: "line1".to_string(),
//!                     city: "city".to_string(),
//!                     ..Default::default()
//!                 },
//!                 lines: vec![CreateOrdersRequestLinesItem {
//!                     sku: "sku".to_string(),
//!                     quantity: 1,
//!                     ..Default::default()
//!                 }],
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

pub use client::*;
pub use config::*;
pub use core::*;
pub use environment::*;
pub use error::{ApiError, BuildError};
