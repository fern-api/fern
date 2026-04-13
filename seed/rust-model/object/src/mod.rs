//! Request and response types for the object
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Model Types**: 3 types for data representation

pub mod type_eighteen;
pub mod r#type;
pub mod name;

pub use type_eighteen::TypeEighteen;
pub use r#type::Type;
pub use name::Name;

