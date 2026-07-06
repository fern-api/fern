pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct SearchProductsResponse {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub results: Option<Vec<Product>>,
}

impl SearchProductsResponse {
    pub fn builder() -> SearchProductsResponseBuilder {
        <SearchProductsResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SearchProductsResponseBuilder {
    results: Option<Vec<Product>>,
}

impl SearchProductsResponseBuilder {
    pub fn results(mut self, value: Vec<Product>) -> Self {
        self.results = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`SearchProductsResponse`].
    pub fn build(self) -> Result<SearchProductsResponse, BuildError> {
        Ok(SearchProductsResponse {
            results: self.results,
        })
    }
}
