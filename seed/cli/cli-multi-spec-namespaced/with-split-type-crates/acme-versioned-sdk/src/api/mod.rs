//! API client and types for the Users API (v1)
//!
//! This module contains all the API definitions including request/response types
//! and client implementations for interacting with the API.
//!
//! ## Modules
//!
//! - [`resources`] - Service clients and endpoints

pub mod resources;

pub use resources::{ApiClient, V1Client, V2Client};

pub use acme_versioned_types::*;
