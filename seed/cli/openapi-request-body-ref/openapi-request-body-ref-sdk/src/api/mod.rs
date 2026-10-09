//! API client and types for the openapi-request-body-ref
//!
//! This module contains all the API definitions including request/response types
//! and client implementations for interacting with the API.
//!
//! ## Modules
//!
//! - [`resources`] - Service clients and endpoints

pub mod resources;

pub use resources::{ApiClient, CatalogClient, TeamMemberClient, VendorClient};

pub use openapi_request_body_ref_types::*;
