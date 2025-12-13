pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ListUsersOptionalDataPaginationResponse {
    #[serde(rename = "hasNextPage")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub has_next_page: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub page: Option<Page2>,
    /// The totall number of /users
    pub total_count: i64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<Vec<User2>>,
}
