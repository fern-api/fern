//! Request and response types for the Streaming
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 3 types for API operations

pub mod dummy_stream_response;
pub mod generate_stream_request;
pub mod generateequest;

pub use dummy_stream_response::StreamResponse;
pub use generate_stream_request::GenerateStreamRequest;
pub use generateequest::Generateequest;

