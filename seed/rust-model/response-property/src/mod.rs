//! Request and response types for the ResponseProperty
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
pub mod service_with_docs;
pub mod service_optional_with_docs;
pub mod service_movie;
pub mod service_response;

pub use string_response::StringResponse;
pub use optional_string_response::OptionalStringResponse;
pub use with_metadata::WithMetadata;
pub use service_with_docs::WithDocs;
pub use service_optional_with_docs::OptionalWithDocs;
pub use service_movie::Movie;
pub use service_response::Response;

