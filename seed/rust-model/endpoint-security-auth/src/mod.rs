//! Request and response types for the endpoint-security-auth
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 4 types for API operations
//! - **Model Types**: 1 types for data representation

pub mod auth_auth_get_token_request_audience;
pub mod auth_auth_get_token_request_grant_type;
pub mod token_response;
pub mod user;
pub mod auth_get_token_request;

pub use auth_auth_get_token_request_audience::AuthGetTokenRequestAudience;
pub use auth_auth_get_token_request_grant_type::AuthGetTokenRequestGrantType;
pub use token_response::TokenResponse;
pub use user::User;
pub use auth_get_token_request::AuthGetTokenRequest;

