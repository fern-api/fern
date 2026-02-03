pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UserPage2 {
    pub data: UserListContainer2,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub next: Option<Uuid>,
}