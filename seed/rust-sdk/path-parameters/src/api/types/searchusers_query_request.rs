pub use crate::prelude::*;

/// Query parameters for searchusers
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct SearchusersQueryRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub limit: Option<i64>,
}

impl SearchusersQueryRequest {
    pub fn builder() -> SearchusersQueryRequestBuilder {
        <SearchusersQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SearchusersQueryRequestBuilder {
    limit: Option<i64>,
}

impl SearchusersQueryRequestBuilder {
    pub fn limit(mut self, value: i64) -> Self {
        self.limit = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`SearchusersQueryRequest`].
    pub fn build(self) -> Result<SearchusersQueryRequest, BuildError> {
        Ok(SearchusersQueryRequest { limit: self.limit })
    }
}
