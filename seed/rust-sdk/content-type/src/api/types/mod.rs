pub mod named_mixed_patch_request;
pub mod optional_merge_patch_request;
pub mod patch_complex_request;
pub mod patch_proxy_request;
pub mod regular_patch_request;

pub use named_mixed_patch_request::NamedMixedPatchRequest;
pub use optional_merge_patch_request::OptionalMergePatchRequest;
pub use patch_complex_request::PatchComplexRequest;
pub use patch_proxy_request::PatchProxyRequest;
pub use regular_patch_request::RegularPatchRequest;
