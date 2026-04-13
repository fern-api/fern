//! Request and response types for the nullable
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 3 types for API operations
//! - **Model Types**: 6 types for data representation

pub mod email;
pub mod user_id;
pub mod weird_number;
pub mod user;
pub mod status;
pub mod metadata;
pub mod nullable_create_user_request;
pub mod nullable_delete_user_request;
pub mod getusers_query_request;

pub use email::Email;
pub use user_id::UserId;
pub use weird_number::WeirdNumber;
pub use user::User;
pub use status::Status;
pub use metadata::Metadata;
pub use nullable_create_user_request::NullableCreateUserRequest;
pub use nullable_delete_user_request::NullableDeleteUserRequest;
pub use getusers_query_request::GetusersQueryRequest;

