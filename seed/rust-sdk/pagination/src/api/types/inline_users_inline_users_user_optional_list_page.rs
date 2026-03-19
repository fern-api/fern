pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UserOptionalListPage {
    #[serde(default)]
    pub data: UserOptionalListContainer,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub next: Option<Uuid>,
}
