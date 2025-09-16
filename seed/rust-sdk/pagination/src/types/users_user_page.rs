use crate::users_user_list_container::UserListContainer;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UserPage {
    pub data: UserListContainer,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub next: Option<uuid::Uuid>,
}
