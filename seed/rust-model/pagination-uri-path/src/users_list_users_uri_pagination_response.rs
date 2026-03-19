pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListUsersUriPaginationResponse {
    #[serde(default)]
    pub data: Vec<User>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub next: Option<String>,
}