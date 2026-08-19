//! # server-sent-events-openapi SDK
//!
//! The official Rust SDK for the server-sent-events-openapi.
//!
//! ## Getting Started
//!
//! ```rust
//! use server_sent_events_openapi_sdk::prelude::*;
//!
//! #[tokio::main]
//! async fn main() {
//!     let config = ClientConfig {
//!         ..Default::default()
//!     };
//!     let client = ServerSentEventsOpenapiClient::new(config).expect("Failed to build client");
//!     client
//!         .stream_protocol_no_collision(
//!             &StreamRequest {
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
