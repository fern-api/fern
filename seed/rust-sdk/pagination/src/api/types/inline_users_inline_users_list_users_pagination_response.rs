pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListUsersPaginationResponse {
    #[serde(rename = "hasNextPage")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub has_next_page: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub page: Option<Page>,
    /// The totall number of /users
    #[serde(default)]
    pub total_count: i64,
    #[serde(default)]
    pub data: Users,
}

impl ListUsersPaginationResponse {
    pub fn builder() -> ListUsersPaginationResponseBuilder {
        <ListUsersPaginationResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ListUsersPaginationResponseBuilder {
    has_next_page: Option<bool>,
    page: Option<Page>,
    total_count: Option<i64>,
    data: Option<Users>,
}

impl ListUsersPaginationResponseBuilder {
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

    pub fn data(mut self, value: Users) -> Self {
        self.data = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ListUsersPaginationResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`total_count`](ListUsersPaginationResponseBuilder::total_count)
    /// - [`data`](ListUsersPaginationResponseBuilder::data)
    pub fn build(self) -> Result<ListUsersPaginationResponse, BuildError> {
        Ok(ListUsersPaginationResponse {
            has_next_page: self.has_next_page,
            page: self.page,
            total_count: self
                .total_count
                .ok_or_else(|| BuildError::missing_field("total_count"))?,
            data: self.data.ok_or_else(|| BuildError::missing_field("data"))?,
        })
    }
}
