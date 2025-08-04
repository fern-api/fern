use crate::conversation::Conversation;
use crate::cursor_pages::CursorPages;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct PaginatedConversationResponse {
    pub conversations: Vec<Conversation>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pages: Option<CursorPages>,
    pub total_count: i32,
    pub r#type: String,
}