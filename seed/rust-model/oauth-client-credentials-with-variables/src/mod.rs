//! Request and response types for the oauth-client-credentials-with-variables
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 7 types for API operations

pub mod auth_auth_get_token_with_client_credentials_request_audience;
pub mod auth_auth_get_token_with_client_credentials_request_grant_type;
pub mod auth_auth_refresh_token_request_audience;
pub mod auth_auth_refresh_token_request_grant_type;
pub mod token_response;
pub mod auth_get_token_with_client_credentials_request;
pub mod auth_refresh_token_request;

pub use auth_auth_get_token_with_client_credentials_request_audience::AuthGetTokenWithClientCredentialsRequestAudience;
pub use auth_auth_get_token_with_client_credentials_request_grant_type::AuthGetTokenWithClientCredentialsRequestGrantType;
pub use auth_auth_refresh_token_request_audience::AuthRefreshTokenRequestAudience;
pub use auth_auth_refresh_token_request_grant_type::AuthRefreshTokenRequestGrantType;
pub use token_response::TokenResponse;
pub use auth_get_token_with_client_credentials_request::AuthGetTokenWithClientCredentialsRequest;
pub use auth_refresh_token_request::AuthRefreshTokenRequest;

