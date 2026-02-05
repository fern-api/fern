//! Request and response types for the Errors
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 2 types for API operations
//! - **Model Types**: 1 types for data representation

pub mod commons_error_body;
pub mod simple_foo_request;
pub mod simple_foo_response;

pub use commons_error_body::ErrorBody;
pub use simple_foo_request::FooRequest;
pub use simple_foo_response::FooResponse;

