use crate::inline_users_inline_users_page::Page;
use crate::inline_users_inline_users_user::User;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ListUsersPaginationResponse {
    #[serde(rename = "hasNextPage")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub has_next_page: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub page: Option<Page>,
    /// The totall number of /users
    pub total_count: i64,
    pub data: Vec<User>,
}