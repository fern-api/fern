use crate::types_user_id::UserID;
use crate::types_user_email::UserEmail;
use crate::types_user_age::UserAge;
use crate::types_user_tags::UserTags;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UserProfile {
    pub user_id: UserID,
    pub email: UserEmail,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub age: Option<UserAge>,
    pub tags: UserTags,
}