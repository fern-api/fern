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

impl PaginatedConversationResponse {
    pub fn builder() -> PaginatedConversationResponseBuilder {
        PaginatedConversationResponseBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct PaginatedConversationResponseBuilder {
    conversations: Option<Vec<Conversation>>,
    pages: Option<CursorPages>,
    total_count: Option<i64>,
    r#type: Option<String>,
}

impl PaginatedConversationResponseBuilder {
    pub fn conversations(mut self, value: Vec<Conversation>) -> Self {
        self.conversations = Some(value);
        self
    }

    pub fn pages(mut self, value: CursorPages) -> Self {
        self.pages = Some(value);
        self
    }

    pub fn total_count(mut self, value: i64) -> Self {
        self.total_count = Some(value);
        self
    }

    pub fn r#type(mut self, value: impl Into<String>) -> Self {
        self.r#type = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`PaginatedConversationResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`conversations`](PaginatedConversationResponseBuilder::conversations)
    /// - [`total_count`](PaginatedConversationResponseBuilder::total_count)
    /// - [`r#type`](PaginatedConversationResponseBuilder::r#type)
    pub fn build(self) -> Result<PaginatedConversationResponse, BuildError> {
        Ok(PaginatedConversationResponse {
            conversations: self.conversations.ok_or_else(|| BuildError::missing_field("conversations"))?,
            pages: self.pages,
            total_count: self.total_count.ok_or_else(|| BuildError::missing_field("total_count"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
