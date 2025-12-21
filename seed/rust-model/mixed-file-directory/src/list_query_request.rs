pub use crate::prelude::*;

/// Query parameters for list
///
/// Request type for the ListQueryRequest operation.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListQueryRequest {
    /// The maximum number of results to return.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub limit: Option<i64>,
}
