//! API client and types for the OAuth Client Credentials OpenAPI
//!
//! This module contains all the API definitions including request/response types
//! and client implementations for interacting with the API.
//!
//! ## Modules
//!
//! - [`resources`] - Service clients and endpoints

pub mod resources;

pub use resources::{ApiClient, IdentityClient, PlantsClient};

pub use oauth_client_credentials_openapi_types::*;
