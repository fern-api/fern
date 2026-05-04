pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListUsersBodyCursorPaginationRequest {
    /// The object that contains the cursor used for pagination
    /// in order to fetch the next page of results.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pagination: Option<WithCursor>,
}

impl ListUsersBodyCursorPaginationRequest {
    pub fn builder() -> ListUsersBodyCursorPaginationRequestBuilder {
        <ListUsersBodyCursorPaginationRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ListUsersBodyCursorPaginationRequestBuilder {
    pagination: Option<WithCursor>,
}

impl ListUsersBodyCursorPaginationRequestBuilder {
    pub fn pagination(mut self, value: WithCursor) -> Self {
        self.pagination = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ListUsersBodyCursorPaginationRequest`].
    pub fn build(self) -> Result<ListUsersBodyCursorPaginationRequest, BuildError> {
        Ok(ListUsersBodyCursorPaginationRequest {
            pagination: self.pagination,
        })
    }
}
