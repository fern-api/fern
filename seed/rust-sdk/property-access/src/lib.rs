//! # PropertyAccess SDK
//!
//! The official Rust SDK for the PropertyAccess.
//!
//! ## Getting Started
//!
//! ```rust
//! use seed_property_access::prelude::*;
//!
//! #[tokio::main]
//! async fn main() {
//!     let config = ClientConfig {
//!         ..Default::default()
//!     };
//!     let client = PropertyAccessClient::new(config).expect("Failed to build client");
//!     client
//!         .create_user(
//!             &User {
//!                 id: "id".to_string(),
//!                 email: "email".to_string(),
//!                 password: "password".to_string(),
//!                 profile: UserProfile {
//!                     name: "name".to_string(),
//!                     verification: UserProfileVerification {
//!                         verified: "verified".to_string(),
//!                     },
//!                     ssn: "ssn".to_string(),
//!                 },
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
