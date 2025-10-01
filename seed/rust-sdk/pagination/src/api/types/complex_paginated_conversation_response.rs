use crate::complex_conversation::Conversation;
use crate::complex_cursor_pages::CursorPages;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct PaginatedConversationResponse {
    pub conversations: Vec<Conversation>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pages: Option<CursorPages>,
    pub total_count: i64,
    pub r#type: String,
}
