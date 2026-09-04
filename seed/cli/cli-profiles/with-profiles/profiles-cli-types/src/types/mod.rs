//! Request and response types for the Profiles CLI
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 2 types for API operations
//! - **Model Types**: 1 types for data representation

pub mod messages_list_messages_request_direction;
pub mod message;
pub mod list_query_request;

pub use messages_list_messages_request_direction::ListMessagesRequestDirection;
pub use message::Message;
pub use list_query_request::ListQueryRequest;

