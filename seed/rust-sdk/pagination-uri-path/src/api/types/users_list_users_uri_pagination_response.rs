pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ListUsersUriPaginationResponse {
    pub data: Vec<User>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub next: Option<String>,
}
