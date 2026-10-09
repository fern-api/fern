//! Request and response types for the OAuth API
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 2 types for API operations

pub mod oauth_get_token_response;
pub mod get_token_request;

pub use oauth_get_token_response::GetTokenResponse;
pub use get_token_request::GetTokenRequest;

