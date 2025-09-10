use serde::{Deserialize, Serialize};
use crate::types::user_optional_list_page::UserOptionalListPage;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ListUsersExtendedOptionalListResponse {
    #[serde(flatten)]
    pub user_optional_list_page_fields: UserOptionalListPage,
    pub total_count: i32,
}