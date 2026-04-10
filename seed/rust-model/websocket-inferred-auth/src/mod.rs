//! Request and response types for the WebsocketAuth
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 3 types for API operations
//! - **Model Types**: 7 types for data representation

pub mod auth_token_response;
pub mod realtime_send_event;
pub mod realtime_send_snake_case;
pub mod realtime_receive_event;
pub mod realtime_receive_snake_case;
pub mod realtime_send_event_2;
pub mod realtime_receive_event_2;
pub mod realtime_receive_event_3;
pub mod get_token_request;
pub mod refresh_token_request;

pub use auth_token_response::TokenResponse;
pub use realtime_send_event::SendEvent;
pub use realtime_send_snake_case::SendSnakeCase;
pub use realtime_receive_event::ReceiveEvent;
pub use realtime_receive_snake_case::ReceiveSnakeCase;
pub use realtime_send_event_2::SendEvent2;
pub use realtime_receive_event_2::ReceiveEvent2;
pub use realtime_receive_event_3::ReceiveEvent3;
pub use get_token_request::GetTokenRequest;
pub use refresh_token_request::RefreshTokenRequest;

