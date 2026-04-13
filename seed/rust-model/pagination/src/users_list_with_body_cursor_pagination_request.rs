pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UsersListWithBodyCursorPaginationRequest {
    /// The object that contains the cursor used for pagination
    /// in order to fetch the next page of results.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pagination: Option<WithCursor>,
}

impl UsersListWithBodyCursorPaginationRequest {
    pub fn builder() -> UsersListWithBodyCursorPaginationRequestBuilder {
        <UsersListWithBodyCursorPaginationRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UsersListWithBodyCursorPaginationRequestBuilder {
    pagination: Option<WithCursor>,
}

impl UsersListWithBodyCursorPaginationRequestBuilder {
    pub fn pagination(mut self, value: WithCursor) -> Self {
        self.pagination = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UsersListWithBodyCursorPaginationRequest`].
    pub fn build(self) -> Result<UsersListWithBodyCursorPaginationRequest, BuildError> {
        Ok(UsersListWithBodyCursorPaginationRequest {
            pagination: self.pagination,
        })
    }
}

