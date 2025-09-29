use crate::inline_users_inline_users_user_optional_list_page::UserOptionalListPage;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ListUsersExtendedOptionalListResponse {
    #[serde(flatten)]
    pub user_optional_list_page_fields: UserOptionalListPage,
    /// The totall number of /users
    pub total_count: i32,
}