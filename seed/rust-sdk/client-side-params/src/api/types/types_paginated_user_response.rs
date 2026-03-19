pub use crate::prelude::*;

/// Response with pagination info like Auth0
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct PaginatedUserResponse {
    #[serde(default)]
    pub users: Vec<User>,
    #[serde(default)]
    pub start: i64,
    #[serde(default)]
    pub limit: i64,
    #[serde(default)]
    pub length: i64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub total: Option<i64>,
}
