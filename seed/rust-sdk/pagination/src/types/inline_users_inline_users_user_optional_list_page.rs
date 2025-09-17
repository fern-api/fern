use crate::inline_users_inline_users_user_optional_list_container::UserOptionalListContainer;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UserOptionalListPage {
    pub data: UserOptionalListContainer,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub next: Option<uuid::Uuid>,
}
