pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SearchRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pagination: Option<StartingAfterPaging>,
    pub query: SearchRequestQuery,
}

impl SearchRequest {
    pub fn builder() -> SearchRequestBuilder {
        SearchRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SearchRequestBuilder {
    pagination: Option<StartingAfterPaging>,
    query: Option<SearchRequestQuery>,
}

impl SearchRequestBuilder {
    pub fn pagination(mut self, value: StartingAfterPaging) -> Self {
        self.pagination = Some(value);
        self
    }

    pub fn query(mut self, value: SearchRequestQuery) -> Self {
        self.query = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`SearchRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`query`](SearchRequestBuilder::query)
    pub fn build(self) -> Result<SearchRequest, BuildError> {
        Ok(SearchRequest {
            pagination: self.pagination,
            query: self.query.ok_or_else(|| BuildError::missing_field("query"))?,
        })
    }
}
