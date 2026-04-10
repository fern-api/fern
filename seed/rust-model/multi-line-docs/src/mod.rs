//! Request and response types for the multi-line-docs
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 1 types for API operations
//! - **Model Types**: 2 types for data representation

pub mod operand;
pub mod user;
pub mod user_create_user_request;

pub use operand::Operand;
pub use user::User;
pub use user_create_user_request::UserCreateUserRequest;

