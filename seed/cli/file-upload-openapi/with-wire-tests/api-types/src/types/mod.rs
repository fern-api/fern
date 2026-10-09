//! Request and response types for the api
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 1 types for API operations
//! - **Model Types**: 1 types for data representation

pub mod file_id;
pub mod upload_file_request;

pub use file_id::FileId;
pub use upload_file_request::UploadFileRequest;

