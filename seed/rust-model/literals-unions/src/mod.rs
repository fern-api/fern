//! Request and response types for the LiteralsUnions
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Model Types**: 2 types for data representation

pub mod literals_literal_string;
pub mod literals_union_over_literal;

pub use literals_literal_string::LiteralString;
pub use literals_union_over_literal::UnionOverLiteral;

