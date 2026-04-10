//! Request and response types for the errors
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 2 types for API operations
//! - **Model Types**: 1 types for data representation

pub mod error_body;
pub mod foo_request;
pub mod foo_response;

pub use error_body::ErrorBody;
pub use foo_request::FooRequest;
pub use foo_response::FooResponse;

