//! Request and response types for the mixed-case
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 1 types for API operations
//! - **Model Types**: 9 types for data representation

pub mod organization;
pub mod user;
pub mod nested_user;
pub mod resource_status;
pub mod resource_zero_resource_type;
pub mod resource_zero;
pub mod resource_one_resource_type;
pub mod resource_one;
pub mod resource;
pub mod listresources_query_request;

pub use organization::Organization;
pub use user::User;
pub use nested_user::NestedUser;
pub use resource_status::ResourceStatus;
pub use resource_zero_resource_type::ResourceZeroResourceType;
pub use resource_zero::ResourceZero;
pub use resource_one_resource_type::ResourceOneResourceType;
pub use resource_one::ResourceOne;
pub use resource::Resource;
pub use listresources_query_request::ListresourcesQueryRequest;

