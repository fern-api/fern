//! Request and response types for the null-type
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 2 types for API operations
//! - **Model Types**: 1 types for data representation

pub mod conversations_outbound_call_conversations_response;
pub mod user;
pub mod outbound_call_conversations_request;

pub use conversations_outbound_call_conversations_response::OutboundCallConversationsResponse;
pub use user::User;
pub use outbound_call_conversations_request::OutboundCallConversationsRequest;

