pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListUsersMixedTypePaginationResponse2 {
    #[serde(default)]
    pub next: String,
    #[serde(default)]
    pub data: Vec<User2>,
}
