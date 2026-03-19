pub use crate::prelude::*;

/// Query parameters for getUsers
///
/// Request type for the GetUsersQueryRequest operation.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct GetUsersQueryRequest {
    #[serde(default)]
    pub usernames: Vec<Option<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub avatar: Option<String>,
    #[serde(default)]
    pub activated: Vec<Option<bool>>,
    #[serde(default)]
    pub tags: Vec<Option<Option<String>>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub extra: Option<Option<bool>>,
}
