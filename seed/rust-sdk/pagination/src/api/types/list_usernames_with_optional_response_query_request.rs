pub use crate::prelude::*;

/// Query parameters for listUsernamesWithOptionalResponse
///
/// Request type for the ListUsernamesWithOptionalResponseQueryRequest operation.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListUsernamesWithOptionalResponseQueryRequest {
    /// The cursor used for pagination in order to fetch
    /// the next page of results.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub starting_after: Option<String>,
}
