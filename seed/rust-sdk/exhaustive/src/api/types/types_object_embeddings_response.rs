pub use crate::prelude::*;

/// An object with typed embedding properties. Tests that construct_type
/// handles non-mapping data gracefully when the expected type is an object.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct EmbeddingsResponse {
    pub embeddings: EmbeddingsByModel,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub texts: Option<Vec<String>>,
}