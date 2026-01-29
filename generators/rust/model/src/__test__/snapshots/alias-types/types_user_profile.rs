pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserProfile {
    pub user_id: UserID,
    pub email: UserEmail,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub age: Option<UserAge>,
    pub tags: UserTags,
}