pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct SearchResponse {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub results: Option<Vec<String>>,
}

impl SearchResponse {
    pub fn builder() -> SearchResponseBuilder {
        <SearchResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SearchResponseBuilder {
    results: Option<Vec<String>>,
}

impl SearchResponseBuilder {
    pub fn results(mut self, value: Vec<String>) -> Self {
        self.results = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`SearchResponse`].
    pub fn build(self) -> Result<SearchResponse, BuildError> {
        Ok(SearchResponse {
            results: self.results,
        })
    }
}
