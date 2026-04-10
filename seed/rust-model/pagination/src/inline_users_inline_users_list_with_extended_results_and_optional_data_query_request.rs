pub use crate::prelude::*;

/// Query parameters for inlineUsers_inlineUsers_listWithExtendedResultsAndOptionalData
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct InlineUsersInlineUsersListWithExtendedResultsAndOptionalDataQueryRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cursor: Option<String>,
}

impl InlineUsersInlineUsersListWithExtendedResultsAndOptionalDataQueryRequest {
    pub fn builder() -> InlineUsersInlineUsersListWithExtendedResultsAndOptionalDataQueryRequestBuilder {
        <InlineUsersInlineUsersListWithExtendedResultsAndOptionalDataQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct InlineUsersInlineUsersListWithExtendedResultsAndOptionalDataQueryRequestBuilder {
    cursor: Option<String>,
}

impl InlineUsersInlineUsersListWithExtendedResultsAndOptionalDataQueryRequestBuilder {
    pub fn cursor(mut self, value: impl Into<String>) -> Self {
        self.cursor = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`InlineUsersInlineUsersListWithExtendedResultsAndOptionalDataQueryRequest`].
    pub fn build(self) -> Result<InlineUsersInlineUsersListWithExtendedResultsAndOptionalDataQueryRequest, BuildError> {
        Ok(InlineUsersInlineUsersListWithExtendedResultsAndOptionalDataQueryRequest {
            cursor: self.cursor,
        })
    }
}

