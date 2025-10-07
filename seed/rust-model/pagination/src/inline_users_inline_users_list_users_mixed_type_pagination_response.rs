pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ListUsersMixedTypePaginationResponse {
    pub next: String,
    pub data: Users,
}