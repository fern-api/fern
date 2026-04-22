//! API client and types for the Examples
//!
//! This module contains all the API definitions including request/response types
//! and client implementations for interacting with the API.
//!
//! ## Modules
//!
//! - [`resources`] - Service clients and endpoints
//! - [`types`] - Request, response, and model types

pub mod resources;
pub mod types;

pub use resources::{
    CommonsClient, ExamplesClient, FileClient, HealthClient, ServiceClient4, TypesClient2,
};
pub use types::*;
