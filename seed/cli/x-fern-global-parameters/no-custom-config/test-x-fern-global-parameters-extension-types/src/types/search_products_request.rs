pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct SearchProductsRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub query: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub config: Option<SearchProductsRequestConfig>,
}

impl SearchProductsRequest {
    pub fn builder() -> SearchProductsRequestBuilder {
        <SearchProductsRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SearchProductsRequestBuilder {
    query: Option<String>,
    config: Option<SearchProductsRequestConfig>,
}

impl SearchProductsRequestBuilder {
    pub fn query(mut self, value: impl Into<String>) -> Self {
        self.query = Some(value.into());
        self
    }

    pub fn config(mut self, value: SearchProductsRequestConfig) -> Self {
        self.config = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`SearchProductsRequest`].
    pub fn build(self) -> Result<SearchProductsRequest, BuildError> {
        Ok(SearchProductsRequest {
            query: self.query,
            config: self.config,
        })
    }
}

