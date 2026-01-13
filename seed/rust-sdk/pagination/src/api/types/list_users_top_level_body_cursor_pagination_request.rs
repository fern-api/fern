pub use crate::prelude::*;

/// Request type for API operation
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListUsersTopLevelBodyCursorPaginationRequest {
    /// The cursor used for pagination in order to fetch
    /// the next page of results.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cursor: Option<String>,
    /// An optional filter to apply to the results.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub filter: Option<String>,
}
