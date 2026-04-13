pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct InlineUsersInlineUsersListWithBodyCursorPaginationRequest {
    /// The object that contains the cursor used for pagination
    /// in order to fetch the next page of results.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pagination: Option<InlineUsersWithCursor>,
}

impl InlineUsersInlineUsersListWithBodyCursorPaginationRequest {
    pub fn builder() -> InlineUsersInlineUsersListWithBodyCursorPaginationRequestBuilder {
        <InlineUsersInlineUsersListWithBodyCursorPaginationRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct InlineUsersInlineUsersListWithBodyCursorPaginationRequestBuilder {
    pagination: Option<InlineUsersWithCursor>,
}

impl InlineUsersInlineUsersListWithBodyCursorPaginationRequestBuilder {
    pub fn pagination(mut self, value: InlineUsersWithCursor) -> Self {
        self.pagination = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`InlineUsersInlineUsersListWithBodyCursorPaginationRequest`].
    pub fn build(
        self,
    ) -> Result<InlineUsersInlineUsersListWithBodyCursorPaginationRequest, BuildError> {
        Ok(InlineUsersInlineUsersListWithBodyCursorPaginationRequest {
            pagination: self.pagination,
        })
    }
}
