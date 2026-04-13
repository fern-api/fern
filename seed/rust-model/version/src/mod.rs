//! Request and response types for the version
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Model Types**: 2 types for data representation

pub mod user_id;
pub mod user;

pub use user_id::UserId;
pub use user::User;

