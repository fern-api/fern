pub use crate::prelude::*;

/// Query parameters for listWithExtendedResultsAndOptionalData
///
/// Request type for the InlineUsersInlineUsersListWithExtendedResultsAndOptionalDataQueryRequest operation.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct InlineUsersInlineUsersListWithExtendedResultsAndOptionalDataQueryRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cursor: Option<Uuid>,
}
