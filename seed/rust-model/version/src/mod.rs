//! Request and response types for the Version
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Model Types**: 2 types for data representation

pub mod user_user_id;
pub mod user_user;

pub use user_user_id::UserId;
pub use user_user::User;

