//! # Variables SDK
//!
//! The official Rust SDK for the Variables.
//!
//! ## Getting Started
//!
//! ```rust
//! use seed_variables::prelude::*;
//!
//! #[tokio::main]
//! async fn main() {
//!     let config = ClientConfig {
//!         ..Default::default()
//!     };
//!     let client = VariablesClient::new(config).expect("Failed to build client");
//!     client.service.post(None).await;
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
pub mod error;
pub mod core;
pub mod config;
pub mod client;
pub mod prelude;

pub use error::{ApiError};
pub use core::{*};
pub use config::{*};
pub use client::{*};

