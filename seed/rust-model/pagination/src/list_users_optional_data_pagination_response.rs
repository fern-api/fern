pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListUsersOptionalDataPaginationResponse {
    #[serde(rename = "hasNextPage")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub has_next_page: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub page: Option<Page>,
    /// The totall number of /users
    #[serde(default)]
    pub total_count: i64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<Vec<User>>,
}

impl ListUsersOptionalDataPaginationResponse {
    pub fn builder() -> ListUsersOptionalDataPaginationResponseBuilder {
        <ListUsersOptionalDataPaginationResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ListUsersOptionalDataPaginationResponseBuilder {
    has_next_page: Option<bool>,
    page: Option<Page>,
    total_count: Option<i64>,
    data: Option<Vec<User>>,
}

impl ListUsersOptionalDataPaginationResponseBuilder {
    pub fn has_next_page(mut self, value: bool) -> Self {
        self.has_next_page = Some(value);
        self
    }

    pub fn page(mut self, value: Page) -> Self {
        self.page = Some(value);
        self
    }

    pub fn total_count(mut self, value: i64) -> Self {
        self.total_count = Some(value);
        self
    }

    pub fn data(mut self, value: Vec<User>) -> Self {
        self.data = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ListUsersOptionalDataPaginationResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`total_count`](ListUsersOptionalDataPaginationResponseBuilder::total_count)
    pub fn build(self) -> Result<ListUsersOptionalDataPaginationResponse, BuildError> {
        Ok(ListUsersOptionalDataPaginationResponse {
            has_next_page: self.has_next_page,
            page: self.page,
            total_count: self.total_count.ok_or_else(|| BuildError::missing_field("total_count"))?,
            data: self.data,
        })
    }
}
