//! Request and response types for the literals-unions
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Model Types**: 2 types for data representation

pub mod literal_string;
pub mod union_over_literal;

pub use literal_string::LiteralString;
pub use union_over_literal::UnionOverLiteral;

