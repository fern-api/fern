pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct GetMetadataQueryRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub shallow: Option<bool>,
    pub tag: Vec<Option<String>>,
}
