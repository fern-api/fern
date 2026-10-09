//! API client and types for the multi-url-environment-reference
//!
//! This module contains all the API definitions including request/response types
//! and client implementations for interacting with the API.
//!
//! ## Modules
//!
//! - [`resources`] - Service clients and endpoints

pub mod resources;

pub use resources::{ApiClient, AuthClient, FilesClient, ItemsClient};

pub use multi_url_environment_reference_types::*;
