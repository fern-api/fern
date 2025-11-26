pub use crate::prelude::*;

/// Query parameters for searchUsers
///
/// Request type for the SearchUsersQueryRequest operation.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct SearchUsersQueryRequest {
    pub query: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub department: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub role: Option<String>,
    #[serde(rename = "isActive")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_active: Option<Option<bool>>,
}
