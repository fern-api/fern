//! API client and types for the Path Param Body Collision
//!
//! This module contains all the API definitions including request/response types
//! and client implementations for interacting with the API.
//!
//! ## Modules
//!
//! - [`resources`] - Service clients and endpoints

pub mod resources;

pub use resources::ApiClient;

pub use path_param_body_collision_types::*;
