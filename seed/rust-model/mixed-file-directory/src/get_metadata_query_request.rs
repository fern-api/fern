pub use crate::prelude::*;

/// Query parameters for getMetadata
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct GetMetadataQueryRequest {
    #[serde(default)]
    pub id: Id,
}
