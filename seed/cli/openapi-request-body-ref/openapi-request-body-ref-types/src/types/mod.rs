//! Request and response types for the openapi-request-body-ref
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 6 types for API operations
//! - **Model Types**: 4 types for data representation

pub mod update_vendor_request_status;
pub mod update_vendor_request;
pub mod vendor_status;
pub mod vendor;
pub mod create_catalog_image_request;
pub mod catalog_image;
pub mod team_member;
pub mod create_vendor_request;
pub mod update_team_member_request;
pub mod create_catalog_image_request_upload;

pub use update_vendor_request_status::UpdateVendorRequestStatus;
pub use update_vendor_request::UpdateVendorRequest;
pub use vendor_status::VendorStatus;
pub use vendor::Vendor;
pub use create_catalog_image_request::CreateCatalogImageRequest;
pub use catalog_image::CatalogImage;
pub use team_member::TeamMember;
pub use create_vendor_request::CreateVendorRequest;
pub use update_team_member_request::UpdateTeamMemberRequest;
pub use create_catalog_image_request_upload::CreateCatalogImageRequest2;

