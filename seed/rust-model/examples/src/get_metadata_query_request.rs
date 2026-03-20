pub use crate::prelude::*;

/// Query parameters for getMetadata
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct GetMetadataQueryRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub shallow: Option<bool>,
    #[serde(default)]
    pub tag: Vec<Option<String>>,
}
