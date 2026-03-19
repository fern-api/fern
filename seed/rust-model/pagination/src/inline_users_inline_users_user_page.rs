pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UserPage {
    #[serde(default)]
    pub data: UserListContainer,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub next: Option<Uuid>,
}