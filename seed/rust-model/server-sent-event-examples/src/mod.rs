//! Request and response types for the ServerSentEvents
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 3 types for API operations
//! - **Model Types**: 5 types for data representation

pub mod completions_streamed_completion;
pub mod completions_completion_event;
pub mod completions_error_event;
pub mod completions_stream_event_context_protocol;
pub mod completions_stream_event;
pub mod stream_completion_request;
pub mod stream_events_request;
pub mod stream_events_context_protocol_request;

pub use completions_streamed_completion::StreamedCompletion;
pub use completions_completion_event::CompletionEvent;
pub use completions_error_event::ErrorEvent;
pub use completions_stream_event_context_protocol::StreamEventContextProtocol;
pub use completions_stream_event::StreamEvent;
pub use stream_completion_request::StreamCompletionRequest;
pub use stream_events_request::StreamEventsRequest;
pub use stream_events_context_protocol_request::StreamEventsContextProtocolRequest;

