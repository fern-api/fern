use crate::user_page::UserPage;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ListUsersExtendedResponse {
    #[serde(flatten)]
    pub user_page_fields: UserPage,
    pub total_count: i32,
}