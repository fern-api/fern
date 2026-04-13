//! Request and response types for the multi-url-environment
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 2 types for API operations

pub mod ec2_boot_instance_request;
pub mod s3_get_presigned_url_request;

pub use ec2_boot_instance_request::Ec2BootInstanceRequest;
pub use s3_get_presigned_url_request::S3GetPresignedUrlRequest;

