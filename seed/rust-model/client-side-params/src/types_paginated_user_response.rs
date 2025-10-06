pub use crate::prelude::*;

/// Response with pagination info like Auth0
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct PaginatedUserResponse {
    pub users: Vec<User>,
    pub start: i64,
    pub limit: i64,
    pub length: i64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub total: Option<i64>,
}