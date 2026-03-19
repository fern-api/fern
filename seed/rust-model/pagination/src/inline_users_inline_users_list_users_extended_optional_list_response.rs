pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListUsersExtendedOptionalListResponse {
    #[serde(flatten)]
    pub user_optional_list_page_fields: UserOptionalListPage,
    /// The totall number of /users
    #[serde(default)]
    pub total_count: i64,
}