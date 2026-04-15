//! Request and response types for the multi-url-environment-reference
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 3 types for API operations

pub mod auth_auth_get_token_response;
pub mod auth_get_token_request;
pub mod files_upload_request;

pub use auth_auth_get_token_response::AuthGetTokenResponse;
pub use auth_get_token_request::AuthGetTokenRequest;
pub use files_upload_request::FilesUploadRequest;

