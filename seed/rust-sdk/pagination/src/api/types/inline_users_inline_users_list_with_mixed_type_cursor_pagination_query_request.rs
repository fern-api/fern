pub use crate::prelude::*;

/// Query parameters for listWithMixedTypeCursorPagination
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct InlineUsersInlineUsersListWithMixedTypeCursorPaginationQueryRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cursor: Option<String>,
}

impl InlineUsersInlineUsersListWithMixedTypeCursorPaginationQueryRequest {
    pub fn builder() -> InlineUsersInlineUsersListWithMixedTypeCursorPaginationQueryRequestBuilder {
        InlineUsersInlineUsersListWithMixedTypeCursorPaginationQueryRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct InlineUsersInlineUsersListWithMixedTypeCursorPaginationQueryRequestBuilder {
    cursor: Option<String>,
}

impl InlineUsersInlineUsersListWithMixedTypeCursorPaginationQueryRequestBuilder {
    pub fn cursor(mut self, value: impl Into<String>) -> Self {
        self.cursor = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`InlineUsersInlineUsersListWithMixedTypeCursorPaginationQueryRequest`].
    pub fn build(
        self,
    ) -> Result<InlineUsersInlineUsersListWithMixedTypeCursorPaginationQueryRequest, BuildError>
    {
        Ok(
            InlineUsersInlineUsersListWithMixedTypeCursorPaginationQueryRequest {
                cursor: self.cursor,
            },
        )
    }
}
