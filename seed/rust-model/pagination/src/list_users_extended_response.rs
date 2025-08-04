use serde::{Deserialize, Serialize};
use crate::types::user_page::UserPage;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ListUsersExtendedResponse {
    #[serde(flatten)]
    pub user_page_fields: UserPage,
    pub total_count: i32,
}