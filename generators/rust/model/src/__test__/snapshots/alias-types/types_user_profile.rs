pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UserProfile {
    #[serde(default)]
    pub user_id: UserID,
    #[serde(default)]
    pub email: UserEmail,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub age: Option<UserAge>,
    #[serde(default)]
    pub tags: UserTags,
}