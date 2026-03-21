pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListUsersTopLevelBodyCursorPaginationRequest {
    /// The cursor used for pagination in order to fetch
    /// the next page of results.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cursor: Option<String>,
    /// An optional filter to apply to the results.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub filter: Option<String>,
}

impl ListUsersTopLevelBodyCursorPaginationRequest {
    pub fn builder() -> ListUsersTopLevelBodyCursorPaginationRequestBuilder {
        ListUsersTopLevelBodyCursorPaginationRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ListUsersTopLevelBodyCursorPaginationRequestBuilder {
    cursor: Option<String>,
    filter: Option<String>,
}

impl ListUsersTopLevelBodyCursorPaginationRequestBuilder {
    pub fn cursor(mut self, value: impl Into<String>) -> Self {
        self.cursor = Some(value.into());
        self
    }

    pub fn filter(mut self, value: impl Into<String>) -> Self {
        self.filter = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`ListUsersTopLevelBodyCursorPaginationRequest`].
    pub fn build(self) -> Result<ListUsersTopLevelBodyCursorPaginationRequest, BuildError> {
        Ok(ListUsersTopLevelBodyCursorPaginationRequest {
            cursor: self.cursor,
            filter: self.filter,
        })
    }
}

