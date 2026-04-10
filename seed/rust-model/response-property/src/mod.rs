//! Request and response types for the response-property
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 3 types for API operations
//! - **Model Types**: 4 types for data representation

pub mod string_response;
pub mod optional_string_response;
pub mod with_metadata;
pub mod with_docs;
pub mod optional_with_docs;
pub mod movie;
pub mod response;

pub use string_response::StringResponse;
pub use optional_string_response::OptionalStringResponse;
pub use with_metadata::WithMetadata;
pub use with_docs::WithDocs;
pub use optional_with_docs::OptionalWithDocs;
pub use movie::Movie;
pub use response::Response;

