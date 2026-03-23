pub use crate::prelude::*;

/// Query parameters for getWithPathAndQuery
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct GetWithPathAndQueryQueryRequest {
    #[serde(default)]
    pub query: String,
}

impl GetWithPathAndQueryQueryRequest {
    pub fn builder() -> GetWithPathAndQueryQueryRequestBuilder {
        GetWithPathAndQueryQueryRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GetWithPathAndQueryQueryRequestBuilder {
    query: Option<String>,
}

impl GetWithPathAndQueryQueryRequestBuilder {
    pub fn query(mut self, value: impl Into<String>) -> Self {
        self.query = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`GetWithPathAndQueryQueryRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`query`](GetWithPathAndQueryQueryRequestBuilder::query)
    pub fn build(self) -> Result<GetWithPathAndQueryQueryRequest, BuildError> {
        Ok(GetWithPathAndQueryQueryRequest {
            query: self
                .query
                .ok_or_else(|| BuildError::missing_field("query"))?,
        })
    }
}
