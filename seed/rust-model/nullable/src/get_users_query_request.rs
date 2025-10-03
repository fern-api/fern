pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct GetUsersQueryRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub usernames: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub avatar: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub activated: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tags: Option<Option<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub extra: Option<Option<bool>>,
}
