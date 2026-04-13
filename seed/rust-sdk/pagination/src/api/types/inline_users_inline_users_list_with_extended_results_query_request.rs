pub use crate::prelude::*;

/// Query parameters for inlineUsers_inlineUsers_listWithExtendedResults
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct InlineUsersInlineUsersListWithExtendedResultsQueryRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cursor: Option<String>,
}

impl InlineUsersInlineUsersListWithExtendedResultsQueryRequest {
    pub fn builder() -> InlineUsersInlineUsersListWithExtendedResultsQueryRequestBuilder {
        <InlineUsersInlineUsersListWithExtendedResultsQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct InlineUsersInlineUsersListWithExtendedResultsQueryRequestBuilder {
    cursor: Option<String>,
}

impl InlineUsersInlineUsersListWithExtendedResultsQueryRequestBuilder {
    pub fn cursor(mut self, value: impl Into<String>) -> Self {
        self.cursor = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`InlineUsersInlineUsersListWithExtendedResultsQueryRequest`].
    pub fn build(
        self,
    ) -> Result<InlineUsersInlineUsersListWithExtendedResultsQueryRequest, BuildError> {
        Ok(InlineUsersInlineUsersListWithExtendedResultsQueryRequest {
            cursor: self.cursor,
        })
    }
}
