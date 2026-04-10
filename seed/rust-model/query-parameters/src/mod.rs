//! Request and response types for the QueryParameters
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 1 types for API operations
//! - **Model Types**: 2 types for data representation

pub mod user_user;
pub mod user_nested_user;
pub mod get_username_query_request;

pub use user_user::User;
pub use user_nested_user::NestedUser;
pub use get_username_query_request::GetUsernameQueryRequest;

