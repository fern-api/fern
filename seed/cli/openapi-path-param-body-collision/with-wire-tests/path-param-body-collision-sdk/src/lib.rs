//! # Path Param Body Collision SDK
//!
//! The official Rust SDK for the Path Param Body Collision.
//!
//! ## Getting Started
//!
//! ```rust
//! use path_param_body_collision_sdk::prelude::*;
//!
//! #[tokio::main]
//! async fn main() {
//!     let config = ClientConfig {
//!         ..Default::default()
//!     };
//!     let client = PathParamBodyCollisionClient::new(config).expect("Failed to build client");
//!     client
//!         .update_profile_identifier(
//!             &"profile_123".to_string(),
//!             &"email".to_string(),
//!             &IdentifierUpdate {
//!                 id_type: "phone".to_string(),
//!                 old_value: "+13175556789".to_string(),
//!                 new_value: "+13175556798".to_string(),
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
pub mod environment;
pub mod error;
pub mod prelude;

pub use client::*;
pub use config::*;
pub use core::*;
pub use environment::*;
pub use error::{ApiError, BuildError};
