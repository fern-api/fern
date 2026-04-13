pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct InlineUsersInlineUsersListWithBodyOffsetPaginationRequest {
    /// The object that contains the offset used for pagination
    /// in order to fetch the next page of results.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pagination: Option<InlineUsersWithPage>,
}

impl InlineUsersInlineUsersListWithBodyOffsetPaginationRequest {
    pub fn builder() -> InlineUsersInlineUsersListWithBodyOffsetPaginationRequestBuilder {
        <InlineUsersInlineUsersListWithBodyOffsetPaginationRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct InlineUsersInlineUsersListWithBodyOffsetPaginationRequestBuilder {
    pagination: Option<InlineUsersWithPage>,
}

impl InlineUsersInlineUsersListWithBodyOffsetPaginationRequestBuilder {
    pub fn pagination(mut self, value: InlineUsersWithPage) -> Self {
        self.pagination = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`InlineUsersInlineUsersListWithBodyOffsetPaginationRequest`].
    pub fn build(
        self,
    ) -> Result<InlineUsersInlineUsersListWithBodyOffsetPaginationRequest, BuildError> {
        Ok(InlineUsersInlineUsersListWithBodyOffsetPaginationRequest {
            pagination: self.pagination,
        })
    }
}
