use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ListUsernamesQueryRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub starting_after: Option<String>,
}