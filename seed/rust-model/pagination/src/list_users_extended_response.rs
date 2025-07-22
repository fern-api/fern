use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ListUsersExtendedResponse {
    pub total_count: i32,
}