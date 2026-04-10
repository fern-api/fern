pub use crate::prelude::*;

/// Query parameters for endpoints_params_getWithAllowMultipleQuery
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct EndpointsParamsGetWithAllowMultipleQueryQueryRequest {
    #[serde(default)]
    pub query: Vec<Option<String>>,
    #[serde(default)]
    pub number: Vec<Option<i64>>,
}

impl EndpointsParamsGetWithAllowMultipleQueryQueryRequest {
    pub fn builder() -> EndpointsParamsGetWithAllowMultipleQueryQueryRequestBuilder {
        <EndpointsParamsGetWithAllowMultipleQueryQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct EndpointsParamsGetWithAllowMultipleQueryQueryRequestBuilder {
    query: Option<Vec<Option<String>>>,
    number: Option<Vec<Option<i64>>>,
}

impl EndpointsParamsGetWithAllowMultipleQueryQueryRequestBuilder {
    pub fn query(mut self, value: Vec<Option<String>>) -> Self {
        self.query = Some(value);
        self
    }

    pub fn number(mut self, value: Vec<Option<i64>>) -> Self {
        self.number = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`EndpointsParamsGetWithAllowMultipleQueryQueryRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`query`](EndpointsParamsGetWithAllowMultipleQueryQueryRequestBuilder::query)
    /// - [`number`](EndpointsParamsGetWithAllowMultipleQueryQueryRequestBuilder::number)
    pub fn build(self) -> Result<EndpointsParamsGetWithAllowMultipleQueryQueryRequest, BuildError> {
        Ok(EndpointsParamsGetWithAllowMultipleQueryQueryRequest {
            query: self
                .query
                .ok_or_else(|| BuildError::missing_field("query"))?,
            number: self
                .number
                .ok_or_else(|| BuildError::missing_field("number"))?,
        })
    }
}
