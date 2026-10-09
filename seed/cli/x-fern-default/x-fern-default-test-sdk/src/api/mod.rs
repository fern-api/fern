//! API client and types for the x-fern-default test
//!
//! This module contains all the API definitions including request/response types
//! and client implementations for interacting with the API.
//!
//! ## Modules
//!
//! - [`resources`] - Service clients and endpoints

pub mod resources;

pub use resources::ApiClient;

pub use x_fern_default_test_types::*;
