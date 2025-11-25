//! Request and response types for the OauthClientCredentials
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 2 types for API operations

pub mod auth_token_response;
pub mod get_token_request;

pub use auth_token_response::TokenResponse;
pub use get_token_request::GetTokenRequest;

