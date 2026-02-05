pub use crate::prelude::*;

/// Query parameters for listWithOptionalData
///
/// Request type for the ListWithOptionalDataQueryRequest operation.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListWithOptionalDataQueryRequest {
    /// Defaults to first page
    #[serde(skip_serializing_if = "Option::is_none")]
    pub page: Option<i64>,
}
