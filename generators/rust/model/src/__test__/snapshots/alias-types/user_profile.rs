use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct UserProfile {
    pub user_id: UserID,
    pub email: UserEmail,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub age: Option<UserAge>,
    pub tags: UserTags,
}