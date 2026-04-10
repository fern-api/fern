//! # file-upload SDK
//!
//! The official Rust SDK for the file-upload.
//!
//! ## Getting Started
//!
//! ```rust
//! use seed_api::prelude::*;
//!
//! #[tokio::main]
//! async fn main() {
//!     let config = ClientConfig {
//!         ..Default::default()
//!     };
//!     let client = ApiClient::new(config).expect("Failed to build client");
//!     client
//!         .service
//!         .post(
//!             &PostRequest {
//!                 file: b"test file content".to_vec(),
//!                 file_list: b"test file content".to_vec(),
//!                 maybe_file: b"test file content".to_vec(),
//!                 maybe_file_list: b"test file content".to_vec(),
//!                 maybe_string: None,
//!                 integer: None,
//!                 maybe_integer: None,
//!                 optional_list_of_strings: None,
//!                 list_of_objects: None,
//!                 optional_metadata: None,
//!                 optional_object_type: None,
//!                 optional_id: None,
//!                 alias_object: None,
//!                 list_of_alias_object: None,
//!                 alias_list_of_object: None,
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
pub use error::{ApiError, BuildError};
