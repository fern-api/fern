//! Request and response types for the openapi-pdf-download
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 3 types for API operations
//! - **Model Types**: 1 types for data representation

pub mod asset_report_pdf_get_request;
pub mod asset_report_get_response;
pub mod plaid_error;
pub mod asset_report_pdf_get_response;

pub use asset_report_pdf_get_request::AssetReportPdfGetRequest;
pub use asset_report_get_response::AssetReportGetResponse;
pub use plaid_error::PlaidError;
pub use asset_report_pdf_get_response::AssetReportPdfGetResponse;

