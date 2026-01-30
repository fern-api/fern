pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ListUsersMixedTypePaginationResponse2 {
    pub next: String,
    pub data: Vec<User2>,
}