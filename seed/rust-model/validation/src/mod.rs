//! Request and response types for the Validation
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 2 types for API operations
//! - **Model Types**: 7 types for data representation

pub mod small_integer;
pub mod large_integer;
pub mod double;
pub mod word;
pub mod sentence;
pub mod shape;
pub mod r#type;
pub mod create_request;
pub mod get_query_request;

pub use small_integer::SmallInteger;
pub use large_integer::LargeInteger;
pub use double::Double;
pub use word::Word;
pub use sentence::Sentence;
pub use shape::Shape;
pub use r#type::Type;
pub use create_request::CreateRequest;
pub use get_query_request::GetQueryRequest;

