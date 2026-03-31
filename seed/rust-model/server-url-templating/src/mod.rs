//! Request and response types for the Server URL Templating API
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 2 types for API operations
//! - **Model Types**: 1 types for data representation

pub mod user;
pub mod token_response;
pub mod token_request;

pub use user::User;
pub use token_response::TokenResponse;
pub use token_request::TokenRequest;

