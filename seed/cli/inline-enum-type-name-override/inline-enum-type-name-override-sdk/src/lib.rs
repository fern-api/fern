//! # Inline Enum Type Name Override SDK
//!
//! The official Rust SDK for the Inline Enum Type Name Override.
//!
//! ## Getting Started
//!
//! ```rust
//! use inline_enum_type_name_override_sdk::prelude::*;
//!
//! #[tokio::main]
//! async fn main() {
//!     let config = ClientConfig {
//!         ..Default::default()
//!     };
//!     let client = InlineEnumTypeNameOverrideClient::new(config).expect("Failed to build client");
//!     client
//!         .reporting
//!         .load(
//!             &LoadRequest {
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

pub use client::*;
pub use config::*;
pub use core::*;
pub use error::{ApiError, BuildError};
