//! Request and response types for the NurseryApi
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 1 types for API operations
//! - **Model Types**: 2 types for data representation

pub mod package_package;
pub mod package_record;
pub mod test_query_request;

pub use package_package::Package;
pub use package_record::Record;
pub use test_query_request::TestQueryRequest;

