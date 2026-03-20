pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SearchResourcesRequest {
    /// Search query text
    #[serde(skip_serializing_if = "Option::is_none")]
    pub query: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub filters: Option<HashMap<String, serde_json::Value>>,
    /// Maximum results to return
    #[serde(default)]
    pub limit: i64,
    /// Offset for pagination
    #[serde(default)]
    pub offset: i64,
}
