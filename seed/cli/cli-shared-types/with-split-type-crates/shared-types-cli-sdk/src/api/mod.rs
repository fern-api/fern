//! API client and types for the Shared Types CLI
//!
//! This module contains all the API definitions including request/response types
//! and client implementations for interacting with the API.
//!
//! ## Modules
//!
//! - [`resources`] - Service clients and endpoints

pub mod resources;

pub use resources::{ApiClient, BillingClient, CatalogClient};

pub use shared_types_cli_types::*;
