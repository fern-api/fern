pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct ServiceSearchResourcesRequest {
    /// Search query text
    #[serde(skip_serializing_if = "Option::is_none")]
    pub query: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub filters: Option<HashMap<String, serde_json::Value>>,
    /// Maximum results to return
    #[serde(skip_serializing)]
    #[serde(default)]
    pub limit: i64,
    /// Offset for pagination
    #[serde(skip_serializing)]
    #[serde(default)]
    pub offset: i64,
}

impl ServiceSearchResourcesRequest {
    pub fn builder() -> ServiceSearchResourcesRequestBuilder {
        <ServiceSearchResourcesRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ServiceSearchResourcesRequestBuilder {
    query: Option<String>,
    filters: Option<HashMap<String, serde_json::Value>>,
    limit: Option<i64>,
    offset: Option<i64>,
}

impl ServiceSearchResourcesRequestBuilder {
    pub fn query(mut self, value: impl Into<String>) -> Self {
        self.query = Some(value.into());
        self
    }

    pub fn filters(mut self, value: HashMap<String, serde_json::Value>) -> Self {
        self.filters = Some(value);
        self
    }

    pub fn limit(mut self, value: i64) -> Self {
        self.limit = Some(value);
        self
    }

    pub fn offset(mut self, value: i64) -> Self {
        self.offset = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ServiceSearchResourcesRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`limit`](ServiceSearchResourcesRequestBuilder::limit)
    /// - [`offset`](ServiceSearchResourcesRequestBuilder::offset)
    pub fn build(self) -> Result<ServiceSearchResourcesRequest, BuildError> {
        Ok(ServiceSearchResourcesRequest {
            query: self.query,
            filters: self.filters,
            limit: self
                .limit
                .ok_or_else(|| BuildError::missing_field("limit"))?,
            offset: self
                .offset
                .ok_or_else(|| BuildError::missing_field("offset"))?,
        })
    }
}
