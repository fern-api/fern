pub use crate::prelude::*;

/// Query parameters for listWithExtendedResults
///
/// Request type for the InlineUsersInlineUsersListWithExtendedResultsQueryRequest operation.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct InlineUsersInlineUsersListWithExtendedResultsQueryRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cursor: Option<Uuid>,
}
