pub use crate::prelude::*;

/// Query parameters for listWithGlobalConfig
///
/// Request type for the InlineUsersInlineUsersListWithGlobalConfigQueryRequest operation.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct InlineUsersInlineUsersListWithGlobalConfigQueryRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub offset: Option<i64>,
}
