//! Request and response types for the no-content-response
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 1 types for API operations
//! - **Model Types**: 1 types for data representation

pub mod contact;
pub mod create_contact_request;

pub use contact::Contact;
pub use create_contact_request::CreateContactRequest;

