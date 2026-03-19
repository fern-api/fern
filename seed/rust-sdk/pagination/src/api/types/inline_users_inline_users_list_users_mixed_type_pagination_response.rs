pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListUsersMixedTypePaginationResponse {
    #[serde(default)]
    pub next: String,
    #[serde(default)]
    pub data: Users,
}
