//! Request and response types for the inferred-auth-implicit-api-key
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 1 types for API operations

pub mod token_response;

pub use token_response::TokenResponse;

