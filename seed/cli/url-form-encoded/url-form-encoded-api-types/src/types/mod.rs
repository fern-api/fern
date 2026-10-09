//! Request and response types for the URL Form Encoded API
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 4 types for API operations

pub mod post_submit_response;
pub mod token_request;
pub mod token_response;
pub mod post_submit_request;

pub use post_submit_response::PostSubmitResponse;
pub use token_request::TokenRequest;
pub use token_response::TokenResponse;
pub use post_submit_request::PostSubmitRequest;

