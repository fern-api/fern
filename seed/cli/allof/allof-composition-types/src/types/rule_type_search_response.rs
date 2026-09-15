pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct RuleTypeSearchResponse {
    /// Current page of results from the requested resource.
    #[serde(default)]
    pub results: Vec<RuleType>,
    #[serde(default)]
    pub paging: PagingCursors,
}

impl RuleTypeSearchResponse {
    pub fn builder() -> RuleTypeSearchResponseBuilder {
        <RuleTypeSearchResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct RuleTypeSearchResponseBuilder {
    results: Option<Vec<RuleType>>,
    paging: Option<PagingCursors>,
}

impl RuleTypeSearchResponseBuilder {
    pub fn results(mut self, value: Vec<RuleType>) -> Self {
        self.results = Some(value);
        self
    }

    pub fn paging(mut self, value: PagingCursors) -> Self {
        self.paging = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`RuleTypeSearchResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`results`](RuleTypeSearchResponseBuilder::results)
    /// - [`paging`](RuleTypeSearchResponseBuilder::paging)
    pub fn build(self) -> Result<RuleTypeSearchResponse, BuildError> {
        Ok(RuleTypeSearchResponse {
            results: self.results.ok_or_else(|| BuildError::missing_field("results"))?,
            paging: self.paging.ok_or_else(|| BuildError::missing_field("paging"))?,
        })
    }
}
