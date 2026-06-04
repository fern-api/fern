//! Request and response types for the x-fern-default test
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 2 types for API operations

pub mod test_get_response;
pub mod test_get_query_request;

pub use test_get_response::TestGetResponse;
pub use test_get_query_request::TestGetQueryRequest;

