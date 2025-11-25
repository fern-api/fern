pub use crate::prelude::*;

/// Query parameters for getMetadata
///
/// Request type for the GetMetadataQueryRequest operation.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct GetMetadataQueryRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub shallow: Option<bool>,
    pub tag: Vec<Option<String>>,
}
