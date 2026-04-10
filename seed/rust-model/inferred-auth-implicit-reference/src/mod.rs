//! Request and response types for the InferredAuthImplicit
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 3 types for API operations

pub mod auth_get_token_request;
pub mod auth_refresh_token_request;
pub mod auth_token_response;

pub use auth_get_token_request::GetTokenRequest;
pub use auth_refresh_token_request::RefreshTokenRequest;
pub use auth_token_response::TokenResponse;

