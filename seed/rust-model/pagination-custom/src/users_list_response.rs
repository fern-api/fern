pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UsersListResponse {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub limit: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub count: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub has_more: Option<bool>,
    #[serde(default)]
    pub links: Vec<Link>,
    #[serde(default)]
    pub data: Vec<String>,
}

impl UsersListResponse {
    pub fn builder() -> UsersListResponseBuilder {
        <UsersListResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UsersListResponseBuilder {
    limit: Option<i64>,
    count: Option<i64>,
    has_more: Option<bool>,
    links: Option<Vec<Link>>,
    data: Option<Vec<String>>,
}

impl UsersListResponseBuilder {
    pub fn limit(mut self, value: i64) -> Self {
        self.limit = Some(value);
        self
    }

    pub fn count(mut self, value: i64) -> Self {
        self.count = Some(value);
        self
    }

    pub fn has_more(mut self, value: bool) -> Self {
        self.has_more = Some(value);
        self
    }

    pub fn links(mut self, value: Vec<Link>) -> Self {
        self.links = Some(value);
        self
    }

    pub fn data(mut self, value: Vec<String>) -> Self {
        self.data = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UsersListResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`links`](UsersListResponseBuilder::links)
    /// - [`data`](UsersListResponseBuilder::data)
    pub fn build(self) -> Result<UsersListResponse, BuildError> {
        Ok(UsersListResponse {
            limit: self.limit,
            count: self.count,
            has_more: self.has_more,
            links: self.links.ok_or_else(|| BuildError::missing_field("links"))?,
            data: self.data.ok_or_else(|| BuildError::missing_field("data"))?,
        })
    }
}
