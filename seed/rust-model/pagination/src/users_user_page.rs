pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UsersUserPage {
    pub data: UsersUserListContainer,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub next: Option<Uuid>,
}
