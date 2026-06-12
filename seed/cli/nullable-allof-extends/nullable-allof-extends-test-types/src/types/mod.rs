//! Request and response types for the Nullable AllOf Extends Test
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Model Types**: 3 types for data representation

pub mod root_object;
pub mod normal_object;
pub mod nullable_object;

pub use root_object::RootObject;
pub use normal_object::NormalObject;
pub use nullable_object::NullableObject;

