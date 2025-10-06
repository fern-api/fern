pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ComplexPaginatedConversationResponse {
    pub conversations: Vec<ComplexConversation>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pages: Option<ComplexCursorPages>,
    pub total_count: i64,
    pub r#type: String,
}
