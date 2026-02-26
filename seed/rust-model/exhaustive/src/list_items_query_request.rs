pub use crate::prelude::*;

/// Query parameters for listItems
///
/// Request type for the ListItemsQueryRequest operation.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListItemsQueryRequest {
    /// The cursor for pagination
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cursor: Option<String>,
    /// Maximum number of items to return
    #[serde(skip_serializing_if = "Option::is_none")]
    pub limit: Option<i64>,
}
