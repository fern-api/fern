//! # Websocket SDK
//!
//! The official Rust SDK for the Websocket.
//!
//! ## Getting Started
//!
//! ```rust
//! use seed_websocket::prelude::*;
//!
//! #[tokio::main]
//! async fn main() {
//!     let config = ClientConfig {
//!         ..Default::default()
//!     };
//!     let client = WebsocketClient::new(config).expect("Failed to build client");
//!     client.status.get_status(None).await;
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

