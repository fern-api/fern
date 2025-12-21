//! Request and response types for the Required nullable example
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 2 types for API operations
//! - **Model Types**: 1 types for data representation

pub mod foo;
pub mod update_foo_request;
pub mod get_foo_query_request;

pub use foo::Foo;
pub use update_foo_request::UpdateFooRequest;
pub use get_foo_query_request::GetFooQueryRequest;

