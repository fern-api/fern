//! API client and types for the api-wide-base-path-with-default
//!
//! This module contains all the API definitions including request/response types
//! and client implementations for interacting with the API.
//!
//! ## Modules
//!
//! - [`resources`] - Service clients and endpoints

pub mod resources;

pub use resources::{ApiClient, WidgetsClient};

pub use api_wide_base_path_with_default_types::*;
