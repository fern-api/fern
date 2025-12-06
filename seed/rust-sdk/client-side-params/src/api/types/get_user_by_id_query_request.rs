pub use crate::prelude::*;

/// Query parameters for getUserById
///
/// Request type for the GetUserByIdQueryRequest operation.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct GetUserByIdQueryRequest {
    /// Comma-separated list of fields to include or exclude
    #[serde(skip_serializing_if = "Option::is_none")]
    pub fields: Option<String>,
    /// true to include the fields specified, false to exclude them
    #[serde(skip_serializing_if = "Option::is_none")]
    pub include_fields: Option<bool>,
}
