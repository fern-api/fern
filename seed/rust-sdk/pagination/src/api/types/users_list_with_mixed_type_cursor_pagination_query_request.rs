pub use crate::prelude::*;

/// Query parameters for listWithMixedTypeCursorPagination
///
/// Request type for the UsersListWithMixedTypeCursorPaginationQueryRequest operation.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UsersListWithMixedTypeCursorPaginationQueryRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cursor: Option<String>,
}
