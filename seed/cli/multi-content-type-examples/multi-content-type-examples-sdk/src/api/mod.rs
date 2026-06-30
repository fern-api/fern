//! API client and types for the Multi Content Type Examples
//!
//! This module contains all the API definitions including request/response types
//! and client implementations for interacting with the API.
//!
//! ## Modules
//!
//! - [`resources`] - Service clients and endpoints

pub mod resources;

pub use resources::{ApiClient, ClientsClient};

pub use multi_content_type_examples_types::*;
