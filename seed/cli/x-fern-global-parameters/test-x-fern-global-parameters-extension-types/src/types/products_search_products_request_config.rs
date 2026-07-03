pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct SearchProductsRequestConfig {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub currency: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub limit: Option<i64>,
}

impl SearchProductsRequestConfig {
    pub fn builder() -> SearchProductsRequestConfigBuilder {
        <SearchProductsRequestConfigBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SearchProductsRequestConfigBuilder {
    currency: Option<String>,
    limit: Option<i64>,
}

impl SearchProductsRequestConfigBuilder {
    pub fn currency(mut self, value: impl Into<String>) -> Self {
        self.currency = Some(value.into());
        self
    }

    pub fn limit(mut self, value: i64) -> Self {
        self.limit = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`SearchProductsRequestConfig`].
    pub fn build(self) -> Result<SearchProductsRequestConfig, BuildError> {
        Ok(SearchProductsRequestConfig {
            currency: self.currency,
            limit: self.limit,
        })
    }
}
