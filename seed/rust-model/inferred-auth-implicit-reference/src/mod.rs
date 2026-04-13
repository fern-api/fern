//! Request and response types for the inferred-auth-implicit-reference
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 7 types for API operations

pub mod auth_get_token_request_audience;
pub mod auth_get_token_request_grant_type;
pub mod auth_refresh_token_request_audience;
pub mod auth_refresh_token_request_grant_type;
pub mod token_response;
pub mod get_token_request;
pub mod refresh_token_request;

pub use auth_get_token_request_audience::GetTokenRequestAudience;
pub use auth_get_token_request_grant_type::GetTokenRequestGrantType;
pub use auth_refresh_token_request_audience::RefreshTokenRequestAudience;
pub use auth_refresh_token_request_grant_type::RefreshTokenRequestGrantType;
pub use token_response::TokenResponse;
pub use get_token_request::GetTokenRequest;
pub use refresh_token_request::RefreshTokenRequest;

