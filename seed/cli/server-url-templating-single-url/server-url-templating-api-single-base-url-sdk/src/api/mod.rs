//! API client and types for the Server URL Templating API (single base URL)
//!
//! This module contains all the API definitions including request/response types
//! and client implementations for interacting with the API.
//!
//! ## Modules
//!
//! - [`resources`] - Service clients and endpoints

pub mod resources;

pub use resources::ApiClient;

pub use server_url_templating_api_single_base_url_types::*;
