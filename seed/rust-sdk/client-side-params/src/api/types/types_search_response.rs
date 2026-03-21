pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct SearchResponse {
    #[serde(default)]
    pub results: Vec<Resource>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub total: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub next_offset: Option<i64>,
}

impl SearchResponse {
    pub fn builder() -> SearchResponseBuilder {
        SearchResponseBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SearchResponseBuilder {
    results: Option<Vec<Resource>>,
    total: Option<i64>,
    next_offset: Option<i64>,
}

impl SearchResponseBuilder {
    pub fn results(mut self, value: Vec<Resource>) -> Self {
        self.results = Some(value);
        self
    }

    pub fn total(mut self, value: i64) -> Self {
        self.total = Some(value);
        self
    }

    pub fn next_offset(mut self, value: i64) -> Self {
        self.next_offset = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`SearchResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`results`](SearchResponseBuilder::results)
    pub fn build(self) -> Result<SearchResponse, BuildError> {
        Ok(SearchResponse {
            results: self
                .results
                .ok_or_else(|| BuildError::missing_field("results"))?,
            total: self.total,
            next_offset: self.next_offset,
        })
    }
}
