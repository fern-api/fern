pub use crate::prelude::*;

/// Query parameters for getWithAllowMultipleQuery
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct GetWithAllowMultipleQueryQueryRequest {
    #[serde(default)]
    pub query: Vec<String>,
    #[serde(default)]
    pub number: Vec<i64>,
}

impl GetWithAllowMultipleQueryQueryRequest {
    pub fn builder() -> GetWithAllowMultipleQueryQueryRequestBuilder {
        GetWithAllowMultipleQueryQueryRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GetWithAllowMultipleQueryQueryRequestBuilder {
    query: Option<Vec<String>>,
    number: Option<Vec<i64>>,
}

impl GetWithAllowMultipleQueryQueryRequestBuilder {
    pub fn query(mut self, value: Vec<String>) -> Self {
        self.query = Some(value);
        self
    }

    pub fn number(mut self, value: Vec<i64>) -> Self {
        self.number = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`GetWithAllowMultipleQueryQueryRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`query`](GetWithAllowMultipleQueryQueryRequestBuilder::query)
    /// - [`number`](GetWithAllowMultipleQueryQueryRequestBuilder::number)
    pub fn build(self) -> Result<GetWithAllowMultipleQueryQueryRequest, BuildError> {
        Ok(GetWithAllowMultipleQueryQueryRequest {
            query: self
                .query
                .ok_or_else(|| BuildError::missing_field("query"))?,
            number: self
                .number
                .ok_or_else(|| BuildError::missing_field("number"))?,
        })
    }
}
