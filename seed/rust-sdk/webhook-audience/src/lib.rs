//! # Webhook Audience Test SDK
//!
//! The official Rust SDK for the Webhook Audience Test.
//!
//! ## Getting Started
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
pub use api::{*};
pub use core::{*};
pub use config::{*};
pub use client::{*};

