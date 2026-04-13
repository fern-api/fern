pub use crate::prelude::*;

/// Query parameters for searchorganizations
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct SearchorganizationsQueryRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub limit: Option<i64>,
}

impl SearchorganizationsQueryRequest {
    pub fn builder() -> SearchorganizationsQueryRequestBuilder {
        <SearchorganizationsQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SearchorganizationsQueryRequestBuilder {
    limit: Option<i64>,
}

impl SearchorganizationsQueryRequestBuilder {
    pub fn limit(mut self, value: i64) -> Self {
        self.limit = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`SearchorganizationsQueryRequest`].
    pub fn build(self) -> Result<SearchorganizationsQueryRequest, BuildError> {
        Ok(SearchorganizationsQueryRequest { limit: self.limit })
    }
}
