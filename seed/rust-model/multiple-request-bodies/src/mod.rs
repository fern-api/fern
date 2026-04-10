//! Request and response types for the Sample API
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 2 types for API operations
//! - **Model Types**: 2 types for data representation

pub mod document_metadata;
pub mod document_upload_result;
pub mod upload_document_response;
pub mod upload_document_request;

pub use document_metadata::DocumentMetadata;
pub use document_upload_result::DocumentUploadResult;
pub use upload_document_response::UploadDocumentResponse;
pub use upload_document_request::UploadDocumentRequest;

