pub use crate::prelude::*;

/// Query parameters for getWithQuery
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct GetWithQueryQueryRequest {
    #[serde(default)]
    pub query: String,
    #[serde(default)]
    pub number: i64,
}

impl GetWithQueryQueryRequest {
    pub fn builder() -> GetWithQueryQueryRequestBuilder {
        GetWithQueryQueryRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GetWithQueryQueryRequestBuilder {
    query: Option<String>,
    number: Option<i64>,
}

impl GetWithQueryQueryRequestBuilder {
    pub fn query(mut self, value: impl Into<String>) -> Self {
        self.query = Some(value.into());
        self
    }

    pub fn number(mut self, value: i64) -> Self {
        self.number = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`GetWithQueryQueryRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`query`](GetWithQueryQueryRequestBuilder::query)
    /// - [`number`](GetWithQueryQueryRequestBuilder::number)
    pub fn build(self) -> Result<GetWithQueryQueryRequest, BuildError> {
        Ok(GetWithQueryQueryRequest {
            query: self.query.ok_or_else(|| BuildError::missing_field("query"))?,
            number: self.number.ok_or_else(|| BuildError::missing_field("number"))?,
        })
    }
}

