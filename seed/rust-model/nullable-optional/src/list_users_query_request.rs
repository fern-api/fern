pub use crate::prelude::*;

/// Query parameters for listUsers
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListUsersQueryRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub limit: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub offset: Option<i64>,
    #[serde(rename = "includeDeleted")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub include_deleted: Option<bool>,
    #[serde(rename = "sortBy")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sort_by: Option<String>,
}

impl ListUsersQueryRequest {
    pub fn builder() -> ListUsersQueryRequestBuilder {
        <ListUsersQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ListUsersQueryRequestBuilder {
    limit: Option<i64>,
    offset: Option<i64>,
    include_deleted: Option<bool>,
    sort_by: Option<String>,
}

impl ListUsersQueryRequestBuilder {
    pub fn limit(mut self, value: i64) -> Self {
        self.limit = Some(value);
        self
    }

    pub fn offset(mut self, value: i64) -> Self {
        self.offset = Some(value);
        self
    }

    pub fn include_deleted(mut self, value: bool) -> Self {
        self.include_deleted = Some(value);
        self
    }

    pub fn sort_by(mut self, value: impl Into<String>) -> Self {
        self.sort_by = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`ListUsersQueryRequest`].
    pub fn build(self) -> Result<ListUsersQueryRequest, BuildError> {
        Ok(ListUsersQueryRequest {
            limit: self.limit,
            offset: self.offset,
            include_deleted: self.include_deleted,
            sort_by: self.sort_by,
        })
    }
}

