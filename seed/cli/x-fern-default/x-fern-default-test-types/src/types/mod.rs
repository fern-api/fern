//! Request and response types for the x-fern-default test
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 4 types for API operations

pub mod test_get_response;
pub mod test_get_via_overrides_response;
pub mod test_get_query_request;
pub mod test_get_via_overrides_query_request;

pub use test_get_response::TestGetResponse;
pub use test_get_via_overrides_response::TestGetViaOverridesResponse;
pub use test_get_query_request::TestGetQueryRequest;
pub use test_get_via_overrides_query_request::TestGetViaOverridesQueryRequest;

