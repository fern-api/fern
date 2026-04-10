//! Request and response types for the unknown
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 1 types for API operations
//! - **Model Types**: 1 types for data representation

pub mod my_alias;
pub mod my_object;

pub use my_alias::MyAlias;
pub use my_object::MyObject;

