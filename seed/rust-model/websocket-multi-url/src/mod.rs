//! Request and response types for the websocket-multi-url
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Model Types**: 2 types for data representation

pub mod send_event;
pub mod receive_event;

pub use send_event::SendEvent;
pub use receive_event::ReceiveEvent;

