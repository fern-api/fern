pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UsersListUsersExtendedOptionalListResponse {
    #[serde(flatten)]
    pub user_optional_list_page_fields: UsersUserOptionalListPage,
    /// The totall number of /users
    pub total_count: i64,
}
