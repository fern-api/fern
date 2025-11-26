//! Request and response types for the Object
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Model Types**: 2 types for data representation

pub mod r#type;
pub mod name;

pub use r#type::Type;
pub use name::Name;

