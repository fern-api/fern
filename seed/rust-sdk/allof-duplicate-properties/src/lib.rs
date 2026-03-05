//! # AllOf Duplicate Properties Test SDK
//!
//! The official Rust SDK for the AllOf Duplicate Properties Test.
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
//!         .create_plant_order(
//!             &"plantId".to_string(),
//!             &PlantOrder {
//!                 order_base_fields: OrderBase {
//!                     order_id: "orderId".to_string(),
//!                     amount: 1.1,
//!                     currency: "currency".to_string(),
//!                     date_time: None,
//!                 },
//!                 plant_name: "plantName".to_string(),
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

pub use api::*;
pub use client::*;
pub use config::*;
pub use core::*;
pub use environment::*;
pub use error::ApiError;
