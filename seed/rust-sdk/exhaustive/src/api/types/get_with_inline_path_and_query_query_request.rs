pub use crate::prelude::*;

/// Query parameters for getWithInlinePathAndQuery
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct GetWithInlinePathAndQueryQueryRequest {
    #[serde(default)]
    pub query: String,
}

impl GetWithInlinePathAndQueryQueryRequest {
    pub fn builder() -> GetWithInlinePathAndQueryQueryRequestBuilder {
        <GetWithInlinePathAndQueryQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GetWithInlinePathAndQueryQueryRequestBuilder {
    query: Option<String>,
}

impl GetWithInlinePathAndQueryQueryRequestBuilder {
    pub fn query(mut self, value: impl Into<String>) -> Self {
        self.query = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`GetWithInlinePathAndQueryQueryRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`query`](GetWithInlinePathAndQueryQueryRequestBuilder::query)
    pub fn build(self) -> Result<GetWithInlinePathAndQueryQueryRequest, BuildError> {
        Ok(GetWithInlinePathAndQueryQueryRequest {
            query: self
                .query
                .ok_or_else(|| BuildError::missing_field("query"))?,
        })
    }
}
