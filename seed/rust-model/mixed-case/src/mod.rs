//! Request and response types for the MixedCase
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 1 types for API operations
//! - **Model Types**: 5 types for data representation

pub mod service_organization;
pub mod service_user;
pub mod service_nested_user;
pub mod service_resource_status;
pub mod service_resource;
pub mod list_resources_query_request;

pub use service_organization::Organization;
pub use service_user::User;
pub use service_nested_user::NestedUser;
pub use service_resource_status::ResourceStatus;
pub use service_resource::Resource;
pub use list_resources_query_request::ListResourcesQueryRequest;

