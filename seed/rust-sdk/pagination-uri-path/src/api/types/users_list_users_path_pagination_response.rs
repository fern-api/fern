pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListUsersPathPaginationResponse {
    #[serde(default)]
    pub data: Vec<User>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub next: Option<String>,
}

impl ListUsersPathPaginationResponse {
    pub fn builder() -> ListUsersPathPaginationResponseBuilder {
        <ListUsersPathPaginationResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ListUsersPathPaginationResponseBuilder {
    data: Option<Vec<User>>,
    next: Option<String>,
}

impl ListUsersPathPaginationResponseBuilder {
    pub fn data(mut self, value: Vec<User>) -> Self {
        self.data = Some(value);
        self
    }

    pub fn next(mut self, value: impl Into<String>) -> Self {
        self.next = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`ListUsersPathPaginationResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`data`](ListUsersPathPaginationResponseBuilder::data)
    pub fn build(self) -> Result<ListUsersPathPaginationResponse, BuildError> {
        Ok(ListUsersPathPaginationResponse {
            data: self.data.ok_or_else(|| BuildError::missing_field("data"))?,
            next: self.next,
        })
    }
}
