//! API client and types for the WebsocketBearerAuth
//!
//! This module contains all the API definitions including request/response types
//! and client implementations for interacting with the API.
//!
//! ## Modules
//!
//! - [`resources`] - Service clients and endpoints
//! - [`types`] - Request, response, and model types
//! - [`websocket`] - WebSocket channel clients

pub mod resources;
pub mod types;
pub mod websocket;

pub use resources::WebsocketBearerAuthClient;
pub use types::*;
