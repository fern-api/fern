//! Request and response types for the ServerSentEvents
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 1 types for API operations
//! - **Model Types**: 1 types for data representation

pub mod completions_streamed_completion;
pub mod stream_completion_request;

pub use completions_streamed_completion::StreamedCompletion;
pub use stream_completion_request::StreamCompletionRequest;

