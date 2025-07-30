use crate::user_list_container::UserListContainer;
use uuid::Uuid;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct UserPage {
    pub data: UserListContainer,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub next: Option<uuid::Uuid>,
}