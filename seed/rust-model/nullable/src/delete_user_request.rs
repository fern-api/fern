use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct DeleteUserRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub username: Option<Option<String>>,
}