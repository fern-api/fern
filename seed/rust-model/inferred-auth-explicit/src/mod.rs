//! Request and response types for the InferredAuthExplicit
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 3 types for API operations

pub mod auth_token_response;
pub mod get_token_request;
pub mod refresh_token_request;

pub use auth_token_response::TokenResponse;
pub use get_token_request::GetTokenRequest;
pub use refresh_token_request::RefreshTokenRequest;

