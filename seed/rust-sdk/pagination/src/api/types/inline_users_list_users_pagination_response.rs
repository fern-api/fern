pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct InlineUsersListUsersPaginationResponse {
    #[serde(rename = "hasNextPage")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub has_next_page: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub page: Option<InlineUsersPage>,
    /// The totall number of /users
    #[serde(default)]
    pub total_count: i64,
    #[serde(default)]
    pub data: InlineUsersUsers,
}

impl InlineUsersListUsersPaginationResponse {
    pub fn builder() -> InlineUsersListUsersPaginationResponseBuilder {
        <InlineUsersListUsersPaginationResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct InlineUsersListUsersPaginationResponseBuilder {
    has_next_page: Option<bool>,
    page: Option<InlineUsersPage>,
    total_count: Option<i64>,
    data: Option<InlineUsersUsers>,
}

impl InlineUsersListUsersPaginationResponseBuilder {
    pub fn has_next_page(mut self, value: bool) -> Self {
        self.has_next_page = Some(value);
        self
    }

    pub fn page(mut self, value: InlineUsersPage) -> Self {
        self.page = Some(value);
        self
    }

    pub fn total_count(mut self, value: i64) -> Self {
        self.total_count = Some(value);
        self
    }

    pub fn data(mut self, value: InlineUsersUsers) -> Self {
        self.data = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`InlineUsersListUsersPaginationResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`total_count`](InlineUsersListUsersPaginationResponseBuilder::total_count)
    /// - [`data`](InlineUsersListUsersPaginationResponseBuilder::data)
    pub fn build(self) -> Result<InlineUsersListUsersPaginationResponse, BuildError> {
        Ok(InlineUsersListUsersPaginationResponse {
            has_next_page: self.has_next_page,
            page: self.page,
            total_count: self.total_count.ok_or_else(|| BuildError::missing_field("total_count"))?,
            data: self.data.ok_or_else(|| BuildError::missing_field("data"))?,
        })
    }
}
