//! API client and types for the Webhooks CLI
//!
//! This module contains all the API definitions including request/response types
//! and client implementations for interacting with the API.
//!
//! ## Modules
//!
//! - [`resources`] - Service clients and endpoints

pub mod resources;

pub use resources::{ApiClient, MessagesClient, WebhooksClient};

pub use webhooks_cli_types::*;
