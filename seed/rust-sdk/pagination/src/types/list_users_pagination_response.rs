use crate::page::Page;
use crate::user::User;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ListUsersPaginationResponse {
    #[serde(rename = "hasNextPage")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub has_next_page: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub page: Option<Page>,
    pub total_count: i32,
    pub data: Vec<User>,
}