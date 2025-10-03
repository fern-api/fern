pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct InlineUsersInlineUsersListUsernamesQueryRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub starting_after: Option<String>,
}

