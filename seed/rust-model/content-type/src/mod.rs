//! Request and response types for the ContentTypes
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 5 types for API operations

pub mod patch_proxy_request;
pub mod patch_complex_request;
pub mod named_mixed_patch_request;
pub mod optional_merge_patch_request;
pub mod regular_patch_request;

pub use patch_proxy_request::PatchProxyRequest;
pub use patch_complex_request::PatchComplexRequest;
pub use named_mixed_patch_request::NamedMixedPatchRequest;
pub use optional_merge_patch_request::OptionalMergePatchRequest;
pub use regular_patch_request::RegularPatchRequest;

