//! # Trace SDK
//!
//! The official Rust SDK for the Trace.
//!
//! ## Getting Started
//!
//! ```rust
//! use seed_trace::prelude::*;
//!
//! #[tokio::main]
//! async fn main() {
//!     let config = ClientConfig {
//!         token: Some("<token>".to_string()),
//!         ..Default::default()
//!     };
//!     let client = TraceClient::new(config).expect("Failed to build client");
//!     client.v_2.test(None).await;
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
pub mod environment;

pub use error::{ApiError};
pub use environment::{*};
pub use api::{*};
pub use core::{*};
pub use config::{*};
pub use client::{*};

