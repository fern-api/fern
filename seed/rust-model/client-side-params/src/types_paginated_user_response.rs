use crate::types_user::User;
use serde::{Deserialize, Serialize};

/// Response with pagination info like Auth0
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaginatedUserResponse {
    pub users: Vec<User>,
    pub start: i32,
    pub limit: i32,
    pub length: i32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub total: Option<i32>,
}