pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListUsersPaginationResponse2 {
    #[serde(rename = "hasNextPage")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub has_next_page: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub page: Option<Page2>,
    /// The totall number of /users
    #[serde(default)]
    pub total_count: i64,
    #[serde(default)]
    pub data: Vec<User2>,
}

impl ListUsersPaginationResponse2 {
    pub fn builder() -> ListUsersPaginationResponse2Builder {
        ListUsersPaginationResponse2Builder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ListUsersPaginationResponse2Builder {
    has_next_page: Option<bool>,
    page: Option<Page2>,
    total_count: Option<i64>,
    data: Option<Vec<User2>>,
}

impl ListUsersPaginationResponse2Builder {
    pub fn has_next_page(mut self, value: bool) -> Self {
        self.has_next_page = Some(value);
        self
    }

    pub fn page(mut self, value: Page2) -> Self {
        self.page = Some(value);
        self
    }

    pub fn total_count(mut self, value: i64) -> Self {
        self.total_count = Some(value);
        self
    }

    pub fn data(mut self, value: Vec<User2>) -> Self {
        self.data = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ListUsersPaginationResponse2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`total_count`](ListUsersPaginationResponse2Builder::total_count)
    /// - [`data`](ListUsersPaginationResponse2Builder::data)
    pub fn build(self) -> Result<ListUsersPaginationResponse2, BuildError> {
        Ok(ListUsersPaginationResponse2 {
            has_next_page: self.has_next_page,
            page: self.page,
            total_count: self
                .total_count
                .ok_or_else(|| BuildError::missing_field("total_count"))?,
            data: self.data.ok_or_else(|| BuildError::missing_field("data"))?,
        })
    }
}
