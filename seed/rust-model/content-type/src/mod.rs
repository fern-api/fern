//! Request and response types for the content-type
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 5 types for API operations

pub mod service_patch_request;
pub mod service_patch_complex_request;
pub mod service_named_patch_with_mixed_request;
pub mod service_optional_merge_patch_test_request;
pub mod service_regular_patch_request;

pub use service_patch_request::ServicePatchRequest;
pub use service_patch_complex_request::ServicePatchComplexRequest;
pub use service_named_patch_with_mixed_request::ServiceNamedPatchWithMixedRequest;
pub use service_optional_merge_patch_test_request::ServiceOptionalMergePatchTestRequest;
pub use service_regular_patch_request::ServiceRegularPatchRequest;

