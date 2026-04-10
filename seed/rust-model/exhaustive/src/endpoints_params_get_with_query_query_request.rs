pub use crate::prelude::*;

/// Query parameters for endpoints_params_getWithQuery
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct EndpointsParamsGetWithQueryQueryRequest {
    #[serde(default)]
    pub query: String,
    #[serde(default)]
    pub number: i64,
}

impl EndpointsParamsGetWithQueryQueryRequest {
    pub fn builder() -> EndpointsParamsGetWithQueryQueryRequestBuilder {
        <EndpointsParamsGetWithQueryQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct EndpointsParamsGetWithQueryQueryRequestBuilder {
    query: Option<String>,
    number: Option<i64>,
}

impl EndpointsParamsGetWithQueryQueryRequestBuilder {
    pub fn query(mut self, value: impl Into<String>) -> Self {
        self.query = Some(value.into());
        self
    }

    pub fn number(mut self, value: i64) -> Self {
        self.number = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`EndpointsParamsGetWithQueryQueryRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`query`](EndpointsParamsGetWithQueryQueryRequestBuilder::query)
    /// - [`number`](EndpointsParamsGetWithQueryQueryRequestBuilder::number)
    pub fn build(self) -> Result<EndpointsParamsGetWithQueryQueryRequest, BuildError> {
        Ok(EndpointsParamsGetWithQueryQueryRequest {
            query: self.query.ok_or_else(|| BuildError::missing_field("query"))?,
            number: self.number.ok_or_else(|| BuildError::missing_field("number"))?,
        })
    }
}

