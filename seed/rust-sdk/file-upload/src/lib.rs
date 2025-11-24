//! # FileUpload SDK
//!
//! The official Rust SDK for the FileUpload.
//!
//! ## Getting Started
//!
//! ```rust
//! use seed_file_upload::prelude::*;
//!
//! #[tokio::main]
//! async fn main() {
//!     let config = ClientConfig {
//!         ..Default::default()
//!     };
//!     let client = FileUploadClient::new(config).expect("Failed to build client");
//!     client
//!         .service
//!         .just_file(
//!             &JustFileRequest {
//!                 file: todo!("Missing file value"),
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
