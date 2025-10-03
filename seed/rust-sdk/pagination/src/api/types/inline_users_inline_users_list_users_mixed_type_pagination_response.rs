pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct InlineUsersInlineUsersListUsersMixedTypePaginationResponse {
    pub next: String,
    pub data: Users,
}
