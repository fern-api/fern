//! API client and types for the server-sent-events-openapi
//!
//! This module contains all the API definitions including request/response types
//! and client implementations for interacting with the API.
//!
//! ## Modules
//!
//! - [`resources`] - Service clients and endpoints

pub mod resources;

pub use resources::ApiClient;

pub use server_sent_events_openapi_types::*;
