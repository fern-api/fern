pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct RuleTypeSearchResponse {
    #[serde(default)]
    pub paging: PagingCursors,
    /// Current page of results from the requested resource.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub results: Option<Vec<RuleType>>,
}

impl RuleTypeSearchResponse {
    pub fn builder() -> RuleTypeSearchResponseBuilder {
        <RuleTypeSearchResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct RuleTypeSearchResponseBuilder {
    paging: Option<PagingCursors>,
    results: Option<Vec<RuleType>>,
}

impl RuleTypeSearchResponseBuilder {
    pub fn paging(mut self, value: PagingCursors) -> Self {
        self.paging = Some(value);
        self
    }

    pub fn results(mut self, value: Vec<RuleType>) -> Self {
        self.results = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`RuleTypeSearchResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`paging`](RuleTypeSearchResponseBuilder::paging)
    pub fn build(self) -> Result<RuleTypeSearchResponse, BuildError> {
        Ok(RuleTypeSearchResponse {
            paging: self
                .paging
                .ok_or_else(|| BuildError::missing_field("paging"))?,
            results: self.results,
        })
    }
}
