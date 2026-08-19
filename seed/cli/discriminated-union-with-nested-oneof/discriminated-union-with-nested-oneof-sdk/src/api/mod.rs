//! API client and types for the Discriminated Union with Nested OneOf
//!
//! This module contains all the API definitions including request/response types
//! and client implementations for interacting with the API.
//!
//! ## Modules
//!
//! - [`resources`] - Service clients and endpoints

pub mod resources;

pub use resources::ApiClient;

pub use discriminated_union_with_nested_oneof_types::*;
