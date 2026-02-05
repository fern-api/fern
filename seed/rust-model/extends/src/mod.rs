//! Request and response types for the Extends
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 1 types for API operations
//! - **Model Types**: 4 types for data representation

pub mod example_type;
pub mod nested_type;
pub mod docs;
pub mod json;
pub mod inlined;

pub use example_type::ExampleType;
pub use nested_type::NestedType;
pub use docs::Docs;
pub use json::Json;
pub use inlined::Inlined;

