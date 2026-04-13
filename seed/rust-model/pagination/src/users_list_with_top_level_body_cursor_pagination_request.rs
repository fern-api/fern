pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UsersListWithTopLevelBodyCursorPaginationRequest {
    /// The cursor used for pagination in order to fetch
    /// the next page of results.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cursor: Option<String>,
    /// An optional filter to apply to the results.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub filter: Option<String>,
}

impl UsersListWithTopLevelBodyCursorPaginationRequest {
    pub fn builder() -> UsersListWithTopLevelBodyCursorPaginationRequestBuilder {
        <UsersListWithTopLevelBodyCursorPaginationRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UsersListWithTopLevelBodyCursorPaginationRequestBuilder {
    cursor: Option<String>,
    filter: Option<String>,
}

impl UsersListWithTopLevelBodyCursorPaginationRequestBuilder {
    pub fn cursor(mut self, value: impl Into<String>) -> Self {
        self.cursor = Some(value.into());
        self
    }

    pub fn filter(mut self, value: impl Into<String>) -> Self {
        self.filter = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`UsersListWithTopLevelBodyCursorPaginationRequest`].
    pub fn build(self) -> Result<UsersListWithTopLevelBodyCursorPaginationRequest, BuildError> {
        Ok(UsersListWithTopLevelBodyCursorPaginationRequest {
            cursor: self.cursor,
            filter: self.filter,
        })
    }
}

