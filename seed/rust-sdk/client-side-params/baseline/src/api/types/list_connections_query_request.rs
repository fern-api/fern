pub use crate::prelude::*;

/// Query parameters for listConnections
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListConnectionsQueryRequest {
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

impl ListConnectionsQueryRequest {
    pub fn builder() -> ListConnectionsQueryRequestBuilder {
        <ListConnectionsQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ListConnectionsQueryRequestBuilder {
    strategy: Option<String>,
    name: Option<String>,
    fields: Option<String>,
}

impl ListConnectionsQueryRequestBuilder {
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

    /// Consumes the builder and constructs a [`ListConnectionsQueryRequest`].
    pub fn build(self) -> Result<ListConnectionsQueryRequest, BuildError> {
        Ok(ListConnectionsQueryRequest {
            strategy: self.strategy,
            name: self.name,
            fields: self.fields,
        })
    }
}
