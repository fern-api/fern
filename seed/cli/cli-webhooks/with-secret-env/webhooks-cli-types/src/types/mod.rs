//! Request and response types for the Webhooks CLI
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Model Types**: 4 types for data representation

pub mod webhooks_call_status_webhooks_payload_call_status;
pub mod webhooks_call_status_webhooks_payload;
pub mod message;
pub mod message_received;

pub use webhooks_call_status_webhooks_payload_call_status::CallStatusWebhooksPayloadCallStatus;
pub use webhooks_call_status_webhooks_payload::CallStatusWebhooksPayload;
pub use message::Message;
pub use message_received::MessageReceived;

