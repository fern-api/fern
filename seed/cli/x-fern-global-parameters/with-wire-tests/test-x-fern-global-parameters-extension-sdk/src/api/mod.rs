//! API client and types for the Test x-fern-global-parameters extension
//!
//! This module contains all the API definitions including request/response types
//! and client implementations for interacting with the API.
//!
//! ## Modules
//!
//! - [`resources`] - Service clients and endpoints

pub mod resources;

pub use resources::{ApiClient, ProductsClient};

pub use test_x_fern_global_parameters_extension_types::*;
