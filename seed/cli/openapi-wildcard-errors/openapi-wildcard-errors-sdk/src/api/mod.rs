//! API client and types for the openapi-wildcard-errors
//!
//! This module contains all the API definitions including request/response types
//! and client implementations for interacting with the API.
//!
//! ## Modules
//!
//! - [`resources`] - Service clients and endpoints

pub mod resources;

pub use resources::{ApiClient, ItemsClient};

pub use openapi_wildcard_errors_types::*;
