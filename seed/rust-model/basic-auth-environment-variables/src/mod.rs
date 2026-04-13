//! Request and response types for the basic-auth-environment-variables
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 1 types for API operations

pub mod unauthorized_request_error_body;

pub use unauthorized_request_error_body::UnauthorizedRequestErrorBody;

