pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UsersListUsersMixedTypePaginationResponse {
    pub next: String,
    pub data: Vec<UsersUser>,
}
