pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListUsersBodyCursorPaginationRequest2 {
    /// The object that contains the cursor used for pagination
    /// in order to fetch the next page of results.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pagination: Option<WithCursor2>,
}

impl ListUsersBodyCursorPaginationRequest2 {
    pub fn builder() -> ListUsersBodyCursorPaginationRequest2Builder {
        <ListUsersBodyCursorPaginationRequest2Builder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ListUsersBodyCursorPaginationRequest2Builder {
    pagination: Option<WithCursor2>,
}

impl ListUsersBodyCursorPaginationRequest2Builder {
    pub fn pagination(mut self, value: WithCursor2) -> Self {
        self.pagination = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ListUsersBodyCursorPaginationRequest2`].
    pub fn build(self) -> Result<ListUsersBodyCursorPaginationRequest2, BuildError> {
        Ok(ListUsersBodyCursorPaginationRequest2 {
            pagination: self.pagination,
        })
    }
}
