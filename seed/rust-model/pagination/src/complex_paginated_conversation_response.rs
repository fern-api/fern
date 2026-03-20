pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct PaginatedConversationResponse {
    #[serde(default)]
    pub conversations: Vec<Conversation>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pages: Option<CursorPages>,
    #[serde(default)]
    pub total_count: i64,
    pub r#type: String,
}