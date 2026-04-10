//! Request and response types for the server-sent-events
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 2 types for API operations
//! - **Model Types**: 1 types for data representation

pub mod streamed_completion;
pub mod completions_stream_request;
pub mod completions_stream_without_terminator_request;

pub use streamed_completion::StreamedCompletion;
pub use completions_stream_request::CompletionsStreamRequest;
pub use completions_stream_without_terminator_request::CompletionsStreamWithoutTerminatorRequest;

