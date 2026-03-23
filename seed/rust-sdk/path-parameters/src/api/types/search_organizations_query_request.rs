pub use crate::prelude::*;

/// Query parameters for searchOrganizations
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct SearchOrganizationsQueryRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub limit: Option<i64>,
}

impl SearchOrganizationsQueryRequest {
    pub fn builder() -> SearchOrganizationsQueryRequestBuilder {
        SearchOrganizationsQueryRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SearchOrganizationsQueryRequestBuilder {
    limit: Option<i64>,
}

impl SearchOrganizationsQueryRequestBuilder {
    pub fn limit(mut self, value: i64) -> Self {
        self.limit = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`SearchOrganizationsQueryRequest`].
    pub fn build(self) -> Result<SearchOrganizationsQueryRequest, BuildError> {
        Ok(SearchOrganizationsQueryRequest { limit: self.limit })
    }
}
