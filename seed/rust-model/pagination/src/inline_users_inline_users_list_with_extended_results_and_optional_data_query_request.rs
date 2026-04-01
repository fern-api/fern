pub use crate::prelude::*;

/// Query parameters for listWithExtendedResultsAndOptionalData
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct InlineUsersInlineUsersListWithExtendedResultsAndOptionalDataQueryRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cursor: Option<Uuid>,
}

impl InlineUsersInlineUsersListWithExtendedResultsAndOptionalDataQueryRequest {
    pub fn builder() -> InlineUsersInlineUsersListWithExtendedResultsAndOptionalDataQueryRequestBuilder {
        <InlineUsersInlineUsersListWithExtendedResultsAndOptionalDataQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct InlineUsersInlineUsersListWithExtendedResultsAndOptionalDataQueryRequestBuilder {
    cursor: Option<Uuid>,
}

impl InlineUsersInlineUsersListWithExtendedResultsAndOptionalDataQueryRequestBuilder {
    pub fn cursor(mut self, value: Uuid) -> Self {
        self.cursor = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`InlineUsersInlineUsersListWithExtendedResultsAndOptionalDataQueryRequest`].
    pub fn build(self) -> Result<InlineUsersInlineUsersListWithExtendedResultsAndOptionalDataQueryRequest, BuildError> {
        Ok(InlineUsersInlineUsersListWithExtendedResultsAndOptionalDataQueryRequest {
            cursor: self.cursor,
        })
    }
}

