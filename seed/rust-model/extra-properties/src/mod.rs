//! Request and response types for the ExtraProperties
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 1 types for API operations
//! - **Model Types**: 2 types for data representation

pub mod failure;
pub mod user_user;
pub mod create_user_request;

pub use failure::Failure;
pub use user_user::User;
pub use create_user_request::CreateUserRequest;

