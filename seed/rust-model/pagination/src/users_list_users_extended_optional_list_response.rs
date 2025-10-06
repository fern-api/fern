pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ListUsersExtendedOptionalListResponse2 {
    #[serde(flatten)]
    pub user_optional_list_page_fields: UserOptionalListPage2,
    /// The totall number of /users
    pub total_count: i64,
}