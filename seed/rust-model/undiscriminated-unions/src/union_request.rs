pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct UnionRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub union: Option<UnionMetadataUnion>,
}