//! Request and response types for the reserved-keywords
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 1 types for API operations
//! - **Model Types**: 2 types for data representation

pub mod package;
pub mod record;
pub mod test_query_request;

pub use package::Package;
pub use record::Record;
pub use test_query_request::TestQueryRequest;

