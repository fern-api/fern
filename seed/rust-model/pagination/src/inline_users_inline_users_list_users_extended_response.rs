pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct InlineUsersInlineUsersListUsersExtendedResponse {
    #[serde(flatten)]
    pub user_page_fields: InlineUsersInlineUsersUserPage,
    /// The totall number of /users
    pub total_count: i64,
}