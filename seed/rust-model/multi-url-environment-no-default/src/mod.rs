//! Request and response types for the MultiUrlEnvironmentNoDefault
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 2 types for API operations

pub mod boot_instance_request;
pub mod get_presigned_url_request;

pub use boot_instance_request::BootInstanceRequest;
pub use get_presigned_url_request::GetPresignedUrlRequest;

