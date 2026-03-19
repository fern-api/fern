pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UserOptionalListPage2 {
    #[serde(default)]
    pub data: UserOptionalListContainer2,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub next: Option<Uuid>,
}