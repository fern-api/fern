//! Request and response types for the HttpHead
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 1 types for API operations
//! - **Model Types**: 1 types for data representation

pub mod user_user;
pub mod list_query_request;

pub use user_user::User;
pub use list_query_request::ListQueryRequest;

