pub use crate::prelude::*;

/// Query parameters for getClient
///
/// Request type for the GetClientQueryRequest operation.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct GetClientQueryRequest {
    /// Comma-separated list of fields to include
    #[serde(skip_serializing_if = "Option::is_none")]
    pub fields: Option<String>,
    /// Whether specified fields are included or excluded
    #[serde(skip_serializing_if = "Option::is_none")]
    pub include_fields: Option<bool>,
}
