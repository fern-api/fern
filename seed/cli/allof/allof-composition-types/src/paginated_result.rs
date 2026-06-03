pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct PaginatedResult {
    #[serde(default)]
    pub paging: PagingCursors,
    /// Current page of results from the requested resource.
    #[serde(default)]
    pub results: Vec<serde_json::Value>,
}

impl PaginatedResult {
    pub fn builder() -> PaginatedResultBuilder {
        <PaginatedResultBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct PaginatedResultBuilder {
    paging: Option<PagingCursors>,
    results: Option<Vec<serde_json::Value>>,
}

impl PaginatedResultBuilder {
    pub fn paging(mut self, value: PagingCursors) -> Self {
        self.paging = Some(value);
        self
    }

    pub fn results(mut self, value: Vec<serde_json::Value>) -> Self {
        self.results = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`PaginatedResult`].
    /// This method will fail if any of the following fields are not set:
    /// - [`paging`](PaginatedResultBuilder::paging)
    /// - [`results`](PaginatedResultBuilder::results)
    pub fn build(self) -> Result<PaginatedResult, BuildError> {
        Ok(PaginatedResult {
            paging: self.paging.ok_or_else(|| BuildError::missing_field("paging"))?,
            results: self.results.ok_or_else(|| BuildError::missing_field("results"))?,
        })
    }
}
