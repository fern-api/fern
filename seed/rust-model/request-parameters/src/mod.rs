//! Request and response types for the request-parameters
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 4 types for API operations
//! - **Model Types**: 2 types for data representation

pub mod user;
pub mod nested_user;
pub mod user_create_username_request;
pub mod create_username_body;
pub mod create_username_body_optional_properties;
pub mod getusername_query_request;

pub use user::User;
pub use nested_user::NestedUser;
pub use user_create_username_request::UserCreateUsernameRequest;
pub use create_username_body::CreateUsernameBody;
pub use create_username_body_optional_properties::CreateUsernameBodyOptionalProperties;
pub use getusername_query_request::GetusernameQueryRequest;

