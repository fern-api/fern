//! Request and response types for the Api
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Model Types**: 3 types for data representation

pub mod common_base_type;
pub mod common_child_type;
pub mod derived_derived_type;

pub use common_base_type::BaseType;
pub use common_child_type::ChildType;
pub use derived_derived_type::DerivedType;

