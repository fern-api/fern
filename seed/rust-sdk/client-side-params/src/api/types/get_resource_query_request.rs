pub use crate::prelude::*;

/// Query parameters for getResource
///
/// Request type for the GetResourceQueryRequest operation.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct GetResourceQueryRequest {
    /// Include metadata in response
    #[serde(default)]
    pub include_metadata: bool,
    /// Response format
    #[serde(default)]
    pub format: String,
}
