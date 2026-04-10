pub use crate::prelude::*;

/// Query parameters for endpoints_params_getWithInlinePathAndQuery
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct EndpointsParamsGetWithInlinePathAndQueryQueryRequest {
    #[serde(default)]
    pub query: String,
}

impl EndpointsParamsGetWithInlinePathAndQueryQueryRequest {
    pub fn builder() -> EndpointsParamsGetWithInlinePathAndQueryQueryRequestBuilder {
        <EndpointsParamsGetWithInlinePathAndQueryQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct EndpointsParamsGetWithInlinePathAndQueryQueryRequestBuilder {
    query: Option<String>,
}

impl EndpointsParamsGetWithInlinePathAndQueryQueryRequestBuilder {
    pub fn query(mut self, value: impl Into<String>) -> Self {
        self.query = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`EndpointsParamsGetWithInlinePathAndQueryQueryRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`query`](EndpointsParamsGetWithInlinePathAndQueryQueryRequestBuilder::query)
    pub fn build(self) -> Result<EndpointsParamsGetWithInlinePathAndQueryQueryRequest, BuildError> {
        Ok(EndpointsParamsGetWithInlinePathAndQueryQueryRequest {
            query: self.query.ok_or_else(|| BuildError::missing_field("query"))?,
        })
    }
}

