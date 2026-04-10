pub use crate::prelude::*;

/// Query parameters for endpoints_pagination_listItems
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct EndpointsPaginationListItemsQueryRequest {
    /// The cursor for pagination
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cursor: Option<String>,
    /// Maximum number of items to return
    #[serde(skip_serializing_if = "Option::is_none")]
    pub limit: Option<i64>,
}

impl EndpointsPaginationListItemsQueryRequest {
    pub fn builder() -> EndpointsPaginationListItemsQueryRequestBuilder {
        <EndpointsPaginationListItemsQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct EndpointsPaginationListItemsQueryRequestBuilder {
    cursor: Option<String>,
    limit: Option<i64>,
}

impl EndpointsPaginationListItemsQueryRequestBuilder {
    pub fn cursor(mut self, value: impl Into<String>) -> Self {
        self.cursor = Some(value.into());
        self
    }

    pub fn limit(mut self, value: i64) -> Self {
        self.limit = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`EndpointsPaginationListItemsQueryRequest`].
    pub fn build(self) -> Result<EndpointsPaginationListItemsQueryRequest, BuildError> {
        Ok(EndpointsPaginationListItemsQueryRequest {
            cursor: self.cursor,
            limit: self.limit,
        })
    }
}
