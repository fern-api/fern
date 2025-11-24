pub use crate::prelude::*;

/// Request type for API operation
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListUsersBodyOffsetPaginationRequest {
    /// The object that contains the offset used for pagination
    /// in order to fetch the next page of results.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pagination: Option<WithPage>,
}
