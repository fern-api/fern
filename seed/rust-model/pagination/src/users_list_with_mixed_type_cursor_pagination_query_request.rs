pub use crate::prelude::*;

/// Query parameters for listWithMixedTypeCursorPagination
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UsersListWithMixedTypeCursorPaginationQueryRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cursor: Option<String>,
}

impl UsersListWithMixedTypeCursorPaginationQueryRequest {
    pub fn builder() -> UsersListWithMixedTypeCursorPaginationQueryRequestBuilder {
        <UsersListWithMixedTypeCursorPaginationQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UsersListWithMixedTypeCursorPaginationQueryRequestBuilder {
    cursor: Option<String>,
}

impl UsersListWithMixedTypeCursorPaginationQueryRequestBuilder {
    pub fn cursor(mut self, value: impl Into<String>) -> Self {
        self.cursor = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`UsersListWithMixedTypeCursorPaginationQueryRequest`].
    pub fn build(self) -> Result<UsersListWithMixedTypeCursorPaginationQueryRequest, BuildError> {
        Ok(UsersListWithMixedTypeCursorPaginationQueryRequest {
            cursor: self.cursor,
        })
    }
}

