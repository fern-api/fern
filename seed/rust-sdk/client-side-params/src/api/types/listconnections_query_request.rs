pub use crate::prelude::*;

/// Query parameters for listconnections
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListconnectionsQueryRequest {
    /// Filter by strategy type (e.g., auth0, google-oauth2, samlp)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub strategy: Option<String>,
    /// Filter by connection name
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    /// Comma-separated list of fields to include
    #[serde(skip_serializing_if = "Option::is_none")]
    pub fields: Option<String>,
}

impl ListconnectionsQueryRequest {
    pub fn builder() -> ListconnectionsQueryRequestBuilder {
        <ListconnectionsQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ListconnectionsQueryRequestBuilder {
    strategy: Option<String>,
    name: Option<String>,
    fields: Option<String>,
}

impl ListconnectionsQueryRequestBuilder {
    pub fn strategy(mut self, value: impl Into<String>) -> Self {
        self.strategy = Some(value.into());
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn fields(mut self, value: impl Into<String>) -> Self {
        self.fields = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`ListconnectionsQueryRequest`].
    pub fn build(self) -> Result<ListconnectionsQueryRequest, BuildError> {
        Ok(ListconnectionsQueryRequest {
            strategy: self.strategy,
            name: self.name,
            fields: self.fields,
        })
    }
}
