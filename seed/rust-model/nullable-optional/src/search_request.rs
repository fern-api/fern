pub use crate::prelude::*;

/// Request type for API operation
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SearchRequest {
    pub query: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub filters: Option<HashMap<String, Option<String>>>,
    #[serde(rename = "includeTypes")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub include_types: Option<Vec<String>>,
}
