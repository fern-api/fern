pub use crate::prelude::*;

/// Query parameters for searchUsers
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct SearchUsersQueryRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub limit: Option<i64>,
}

impl SearchUsersQueryRequest {
    pub fn builder() -> SearchUsersQueryRequestBuilder {
        SearchUsersQueryRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SearchUsersQueryRequestBuilder {
    limit: Option<i64>,
}

impl SearchUsersQueryRequestBuilder {
    pub fn limit(mut self, value: i64) -> Self {
        self.limit = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`SearchUsersQueryRequest`].
    pub fn build(self) -> Result<SearchUsersQueryRequest, BuildError> {
        Ok(SearchUsersQueryRequest { limit: self.limit })
    }
}
