//! Request and response types for the query-parameters
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 1 types for API operations
//! - **Model Types**: 2 types for data representation

pub mod user;
pub mod nested_user;
pub mod getusername_query_request;

pub use user::User;
pub use nested_user::NestedUser;
pub use getusername_query_request::GetusernameQueryRequest;

