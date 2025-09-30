use crate::inline_users_inline_users_with_cursor::WithCursor;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListUsersBodyCursorPaginationRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pagination: Option<WithCursor>,
}