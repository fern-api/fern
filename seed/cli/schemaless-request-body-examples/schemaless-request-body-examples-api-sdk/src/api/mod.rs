//! API client and types for the Schemaless Request Body Examples API
//!
//! This module contains all the API definitions including request/response types
//! and client implementations for interacting with the API.
//!
//! ## Modules
//!
//! - [`resources`] - Service clients and endpoints

pub mod resources;

pub use resources::ApiClient;

pub use schemaless_request_body_examples_api_types::*;
