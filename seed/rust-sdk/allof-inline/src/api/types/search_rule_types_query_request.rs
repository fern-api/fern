pub use crate::prelude::*;

/// Query parameters for searchRuleTypes
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct SearchRuleTypesQueryRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub query: Option<String>,
}

impl SearchRuleTypesQueryRequest {
    pub fn builder() -> SearchRuleTypesQueryRequestBuilder {
        <SearchRuleTypesQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SearchRuleTypesQueryRequestBuilder {
    query: Option<String>,
}

impl SearchRuleTypesQueryRequestBuilder {
    pub fn query(mut self, value: impl Into<String>) -> Self {
        self.query = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`SearchRuleTypesQueryRequest`].
    pub fn build(self) -> Result<SearchRuleTypesQueryRequest, BuildError> {
        Ok(SearchRuleTypesQueryRequest { query: self.query })
    }
}
