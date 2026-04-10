//! Request and response types for the pagination-uri-path
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 2 types for API operations
//! - **Model Types**: 1 types for data representation

pub mod user;
pub mod list_users_uri_pagination_response;
pub mod list_users_path_pagination_response;

pub use user::User;
pub use list_users_uri_pagination_response::ListUsersUriPaginationResponse;
pub use list_users_path_pagination_response::ListUsersPathPaginationResponse;

