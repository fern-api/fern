pub use crate::prelude::*;

/// Query parameters for endpoints_params_getWithPathAndQuery
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct EndpointsParamsGetWithPathAndQueryQueryRequest {
    #[serde(default)]
    pub query: String,
}

impl EndpointsParamsGetWithPathAndQueryQueryRequest {
    pub fn builder() -> EndpointsParamsGetWithPathAndQueryQueryRequestBuilder {
        <EndpointsParamsGetWithPathAndQueryQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct EndpointsParamsGetWithPathAndQueryQueryRequestBuilder {
    query: Option<String>,
}

impl EndpointsParamsGetWithPathAndQueryQueryRequestBuilder {
    pub fn query(mut self, value: impl Into<String>) -> Self {
        self.query = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`EndpointsParamsGetWithPathAndQueryQueryRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`query`](EndpointsParamsGetWithPathAndQueryQueryRequestBuilder::query)
    pub fn build(self) -> Result<EndpointsParamsGetWithPathAndQueryQueryRequest, BuildError> {
        Ok(EndpointsParamsGetWithPathAndQueryQueryRequest {
            query: self.query.ok_or_else(|| BuildError::missing_field("query"))?,
        })
    }
}

