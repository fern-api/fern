//! # ServerSentEvents SDK
//!
//! The official Rust SDK for the ServerSentEvents.
//!
//! ## Getting Started
//!
//! ```rust
//! use seed_server_sent_events::prelude::*;
//!
//! #[tokio::main]
//! async fn main() {
//!     let config = ClientConfig {
//!         ..Default::default()
//!     };
//!     let client = ServerSentEventsClient::new(config).expect("Failed to build client");
//!     client
//!         .completions
//!         .stream(
//!             &StreamCompletionRequest {
//!                 query: "foo".to_string(),
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
pub mod error;
pub mod core;
pub mod config;
pub mod client;
pub mod prelude;

pub use error::{ApiError, BuildError};
pub use api::{*};
pub use core::{*};
pub use config::{*};
pub use client::{*};

