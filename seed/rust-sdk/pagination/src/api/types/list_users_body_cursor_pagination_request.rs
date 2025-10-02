pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListUsersBodyCursorPaginationRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pagination: Option<UsersWithCursor>,
}ersWithCursor>,
}