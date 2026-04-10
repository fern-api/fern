//! Request and response types for the server-sent-event-examples
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 3 types for API operations
//! - **Model Types**: 16 types for data representation

pub mod streamed_completion;
pub mod completion_event;
pub mod event_event;
pub mod error_event;
pub mod stream_event_context_protocol_zero_event;
pub mod stream_event_context_protocol_zero;
pub mod stream_event_context_protocol_one_event;
pub mod stream_event_context_protocol_one;
pub mod stream_event_context_protocol_two_event;
pub mod stream_event_context_protocol_two;
pub mod stream_event_context_protocol;
pub mod stream_event_zero_event;
pub mod stream_event_zero;
pub mod stream_event_one_event;
pub mod stream_event_one;
pub mod stream_event;
pub mod completions_stream_request;
pub mod completions_stream_events_request;
pub mod completions_stream_events_context_protocol_request;

pub use streamed_completion::StreamedCompletion;
pub use completion_event::CompletionEvent;
pub use event_event::EventEvent;
pub use error_event::ErrorEvent;
pub use stream_event_context_protocol_zero_event::StreamEventContextProtocolZeroEvent;
pub use stream_event_context_protocol_zero::StreamEventContextProtocolZero;
pub use stream_event_context_protocol_one_event::StreamEventContextProtocolOneEvent;
pub use stream_event_context_protocol_one::StreamEventContextProtocolOne;
pub use stream_event_context_protocol_two_event::StreamEventContextProtocolTwoEvent;
pub use stream_event_context_protocol_two::StreamEventContextProtocolTwo;
pub use stream_event_context_protocol::StreamEventContextProtocol;
pub use stream_event_zero_event::StreamEventZeroEvent;
pub use stream_event_zero::StreamEventZero;
pub use stream_event_one_event::StreamEventOneEvent;
pub use stream_event_one::StreamEventOne;
pub use stream_event::StreamEvent;
pub use completions_stream_request::CompletionsStreamRequest;
pub use completions_stream_events_request::CompletionsStreamEventsRequest;
pub use completions_stream_events_context_protocol_request::CompletionsStreamEventsContextProtocolRequest;

