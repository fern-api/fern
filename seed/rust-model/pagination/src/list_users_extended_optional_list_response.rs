use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ListUsersExtendedOptionalListResponse {
    pub total_count: i32,
}