//! Request and response types for the oauth-client-credentials-nested-root
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 4 types for API operations

pub mod auth_auth_get_token_request_audience;
pub mod auth_auth_get_token_request_grant_type;
pub mod auth_token_response;
pub mod auth_get_token_request;

pub use auth_auth_get_token_request_audience::AuthGetTokenRequestAudience;
pub use auth_auth_get_token_request_grant_type::AuthGetTokenRequestGrantType;
pub use auth_token_response::AuthTokenResponse;
pub use auth_get_token_request::AuthGetTokenRequest;

