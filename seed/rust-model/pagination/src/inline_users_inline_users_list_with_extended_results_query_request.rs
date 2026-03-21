pub use crate::prelude::*;

/// Query parameters for listWithExtendedResults
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct InlineUsersInlineUsersListWithExtendedResultsQueryRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cursor: Option<Uuid>,
}

impl InlineUsersInlineUsersListWithExtendedResultsQueryRequest {
    pub fn builder() -> InlineUsersInlineUsersListWithExtendedResultsQueryRequestBuilder {
        InlineUsersInlineUsersListWithExtendedResultsQueryRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct InlineUsersInlineUsersListWithExtendedResultsQueryRequestBuilder {
    cursor: Option<Uuid>,
}

impl InlineUsersInlineUsersListWithExtendedResultsQueryRequestBuilder {
    pub fn cursor(mut self, value: Uuid) -> Self {
        self.cursor = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`InlineUsersInlineUsersListWithExtendedResultsQueryRequest`].
    pub fn build(self) -> Result<InlineUsersInlineUsersListWithExtendedResultsQueryRequest, BuildError> {
        Ok(InlineUsersInlineUsersListWithExtendedResultsQueryRequest {
            cursor: self.cursor,
        })
    }
}

