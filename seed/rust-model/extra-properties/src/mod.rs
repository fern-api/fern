//! Request and response types for the extra-properties
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 3 types for API operations
//! - **Model Types**: 3 types for data representation

pub mod user_user_create_user_request_type;
pub mod user_user_create_user_request_version;
pub mod failure_status;
pub mod failure;
pub mod user;
pub mod user_create_user_request;

pub use user_user_create_user_request_type::UserCreateUserRequestType;
pub use user_user_create_user_request_version::UserCreateUserRequestVersion;
pub use failure_status::FailureStatus;
pub use failure::Failure;
pub use user::User;
pub use user_create_user_request::UserCreateUserRequest;

