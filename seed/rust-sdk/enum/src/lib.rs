//! # Enum SDK
//!
//! The official Rust SDK for the Enum.
//!
//! ## Getting Started
//!
//! ```rust
//! use seed_enum::prelude::*;
//!
//! #[tokio::main]
//! async fn main() {
//!     let config = ClientConfig {
//!         ..Default::default()
//!     };
//!     let client = EnumClient::new(config).expect("Failed to build client");
//!     client
//!         .headers
//!         .send(Some(
//!             RequestOptions::new()
//!                 .additional_header("operand", Operand::GreaterThan)
//!                 .additional_header("maybeOperand", Some(Operand::GreaterThan))
//!                 .additional_header("operandOrColor", ColorOrOperand::Color(Color::Red)),
//!         ))
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
