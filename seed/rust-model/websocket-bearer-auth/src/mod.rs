//! Request and response types for the websocket-bearer-auth
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Model Types**: 9 types for data representation

pub mod no_auth_send_event;
pub mod no_auth_receive_event;
pub mod send_event;
pub mod send_snake_case;
pub mod receive_event;
pub mod receive_snake_case;
pub mod send_event_2;
pub mod receive_event_2;
pub mod receive_event_3;

pub use no_auth_send_event::NoAuthSendEvent;
pub use no_auth_receive_event::NoAuthReceiveEvent;
pub use send_event::SendEvent;
pub use send_snake_case::SendSnakeCase;
pub use receive_event::ReceiveEvent;
pub use receive_snake_case::ReceiveSnakeCase;
pub use send_event_2::SendEvent2;
pub use receive_event_2::ReceiveEvent2;
pub use receive_event_3::ReceiveEvent3;

