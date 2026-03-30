pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListUsersUriPaginationResponse {
    #[serde(default)]
    pub data: Vec<User>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub next: Option<String>,
}

impl ListUsersUriPaginationResponse {
    pub fn builder() -> ListUsersUriPaginationResponseBuilder {
        <ListUsersUriPaginationResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ListUsersUriPaginationResponseBuilder {
    data: Option<Vec<User>>,
    next: Option<String>,
}

impl ListUsersUriPaginationResponseBuilder {
    pub fn data(mut self, value: Vec<User>) -> Self {
        self.data = Some(value);
        self
    }

    pub fn next(mut self, value: impl Into<String>) -> Self {
        self.next = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`ListUsersUriPaginationResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`data`](ListUsersUriPaginationResponseBuilder::data)
    pub fn build(self) -> Result<ListUsersUriPaginationResponse, BuildError> {
        Ok(ListUsersUriPaginationResponse {
            data: self.data.ok_or_else(|| BuildError::missing_field("data"))?,
            next: self.next,
        })
    }
}
