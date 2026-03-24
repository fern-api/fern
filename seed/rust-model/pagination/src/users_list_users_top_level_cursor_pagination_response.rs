pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListUsersTopLevelCursorPaginationResponse {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub next_cursor: Option<String>,
    #[serde(default)]
    pub data: Vec<User2>,
}

impl ListUsersTopLevelCursorPaginationResponse {
    pub fn builder() -> ListUsersTopLevelCursorPaginationResponseBuilder {
        ListUsersTopLevelCursorPaginationResponseBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ListUsersTopLevelCursorPaginationResponseBuilder {
    next_cursor: Option<String>,
    data: Option<Vec<User2>>,
}

impl ListUsersTopLevelCursorPaginationResponseBuilder {
    pub fn next_cursor(mut self, value: impl Into<String>) -> Self {
        self.next_cursor = Some(value.into());
        self
    }

    pub fn data(mut self, value: Vec<User2>) -> Self {
        self.data = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ListUsersTopLevelCursorPaginationResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`data`](ListUsersTopLevelCursorPaginationResponseBuilder::data)
    pub fn build(self) -> Result<ListUsersTopLevelCursorPaginationResponse, BuildError> {
        Ok(ListUsersTopLevelCursorPaginationResponse {
            next_cursor: self.next_cursor,
            data: self.data.ok_or_else(|| BuildError::missing_field("data"))?,
        })
    }
}
