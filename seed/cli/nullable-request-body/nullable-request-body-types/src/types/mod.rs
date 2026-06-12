//! Request and response types for the nullable-request-body
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 1 types for API operations
//! - **Model Types**: 1 types for data representation

pub mod plain_object;
pub mod test_method_name_request;

pub use plain_object::PlainObject;
pub use test_method_name_request::TestMethodNameRequest;

