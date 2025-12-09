//! Request and response types for the Nullable
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 3 types for API operations
//! - **Model Types**: 6 types for data representation

pub mod nullable_email;
pub mod nullable_user_id;
pub mod nullable_weird_number;
pub mod nullable_user;
pub mod nullable_status;
pub mod nullable_metadata;
pub mod create_user_request;
pub mod delete_user_request;
pub mod get_users_query_request;

pub use nullable_email::Email;
pub use nullable_user_id::UserId;
pub use nullable_weird_number::WeirdNumber;
pub use nullable_user::User;
pub use nullable_status::Status;
pub use nullable_metadata::Metadata;
pub use create_user_request::CreateUserRequest;
pub use delete_user_request::DeleteUserRequest;
pub use get_users_query_request::GetUsersQueryRequest;

