//! Request and response types for the Alias
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Model Types**: 3 types for data representation

pub mod type_id;
pub mod r#type;
pub mod object;

pub use type_id::TypeId;
pub use r#type::Type;
pub use object::Object;

