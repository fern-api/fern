//! API client and types for the Webhook Audience Test
//!
//! This module contains all the API definitions including request/response types
//! and client implementations for interacting with the API.
//!
//! ## Modules
//!
//! - [`resources`] - Service clients and endpoints

pub mod resources;

pub use resources::{ApiClient, WebhooksClient};

pub use webhook_audience_test_types::*;
