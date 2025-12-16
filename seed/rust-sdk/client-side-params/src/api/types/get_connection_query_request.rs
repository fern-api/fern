pub use crate::prelude::*;

/// Query parameters for getConnection
///
/// Request type for the GetConnectionQueryRequest operation.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct GetConnectionQueryRequest {
    /// Comma-separated list of fields to include
    #[serde(skip_serializing_if = "Option::is_none")]
    pub fields: Option<String>,
}
