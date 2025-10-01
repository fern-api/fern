use crate::inline_users_inline_users_with_page::WithPage;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListUsersBodyOffsetPaginationRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pagination: Option<WithPage>,
}
