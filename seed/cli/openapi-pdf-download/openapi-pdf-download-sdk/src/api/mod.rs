//! API client and types for the openapi-pdf-download
//!
//! This module contains all the API definitions including request/response types
//! and client implementations for interacting with the API.
//!
//! ## Modules
//!
//! - [`resources`] - Service clients and endpoints

pub mod resources;

pub use resources::{ApiClient, AssetReportClient};

pub use openapi_pdf_download_types::*;
