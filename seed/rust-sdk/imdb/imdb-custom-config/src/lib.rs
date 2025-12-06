//! # Api SDK
//!
//! The official Rust SDK for the Api.
//!
//! ## Getting Started
//!
//! ```rust
//! use custom_imdb_sdk::prelude::*;
//!
//! #[tokio::main]
//! async fn main() {
//!     let config = ClientConfig {
//!         token: Some("<token>".to_string()),
//!         ..Default::default()
//!     };
//!     let client = CustomImdbClient::new(config).expect("Failed to build client");
//!     client
//!         .imdb
//!         .create_movie(
//!             &CreateMovieRequest {
//!                 title: "title".to_string(),
//!                 rating: 1.1,
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
pub use error::ApiError;
