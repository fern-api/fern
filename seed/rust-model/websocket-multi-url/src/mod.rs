//! Request and response types for the WebsocketMultiUrl
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Model Types**: 2 types for data representation

pub mod realtime_send_event;
pub mod realtime_receive_event;

pub use realtime_send_event::SendEvent;
pub use realtime_receive_event::ReceiveEvent;

