//! Request and response types for the Multi Content Type Examples
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 2 types for API operations
//! - **Model Types**: 2 types for data representation

pub mod client_response;
pub mod client_type;
pub mod client_with_id;
pub mod client_request;

pub use client_response::ClientResponse;
pub use client_type::Client;
pub use client_with_id::ClientWithId;
pub use client_request::ClientRequest;

