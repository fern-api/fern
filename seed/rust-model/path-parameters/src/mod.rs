//! Request and response types for the path-parameters
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 2 types for API operations
//! - **Model Types**: 2 types for data representation

pub mod organization;
pub mod user;
pub mod searchorganizations_query_request;
pub mod searchusers_query_request;

pub use organization::Organization;
pub use user::User;
pub use searchorganizations_query_request::SearchorganizationsQueryRequest;
pub use searchusers_query_request::SearchusersQueryRequest;

