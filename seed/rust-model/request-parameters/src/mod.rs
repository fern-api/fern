//! Request and response types for the RequestParameters
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 2 types for API operations
//! - **Model Types**: 4 types for data representation

pub mod user_user;
pub mod user_nested_user;
pub mod user_create_username_body;
pub mod user_create_username_body_optional_properties;
pub mod create_username_request;
pub mod get_username_query_request;

pub use user_user::User;
pub use user_nested_user::NestedUser;
pub use user_create_username_body::CreateUsernameBody;
pub use user_create_username_body_optional_properties::CreateUsernameBodyOptionalProperties;
pub use create_username_request::CreateUsernameRequest;
pub use get_username_query_request::GetUsernameQueryRequest;

