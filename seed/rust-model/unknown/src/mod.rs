//! Request and response types for the UnknownAsAny
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Model Types**: 2 types for data representation

pub mod unknown_my_alias;
pub mod unknown_my_object;

pub use unknown_my_alias::MyAlias;
pub use unknown_my_object::MyObject;

