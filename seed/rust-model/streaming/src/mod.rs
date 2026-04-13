//! Request and response types for the streaming
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 3 types for API operations

pub mod stream_response;
pub mod dummy_generate_stream_request;
pub mod dummy_generate_request;

pub use stream_response::StreamResponse;
pub use dummy_generate_stream_request::DummyGenerateStreamRequest;
pub use dummy_generate_request::DummyGenerateRequest;

