//! Request and response types for the OAuth Client Credentials OpenAPI
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 2 types for API operations
//! - **Model Types**: 1 types for data representation

pub mod token_response;
pub mod plant;
pub mod get_token_identity_request;

pub use token_response::TokenResponse;
pub use plant::Plant;
pub use get_token_identity_request::GetTokenIdentityRequest;

