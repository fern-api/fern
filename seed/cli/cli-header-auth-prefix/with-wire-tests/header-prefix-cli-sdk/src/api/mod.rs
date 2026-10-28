//! API client and types for the Header Prefix CLI
//!
//! This module contains all the API definitions including request/response types
//! and client implementations for interacting with the API.
//!
//! ## Modules
//!
//! - [`resources`] - Service clients and endpoints

pub mod resources;

pub use resources::{ApiClient, SystemClient, WidgetsClient};

pub use header_prefix_cli_types::*;
