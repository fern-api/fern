pub use crate::prelude::*;

/// Query parameters for listEvents
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListEventsQueryRequest {
    /// The maximum number of results to return.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub limit: Option<i64>,
}

impl ListEventsQueryRequest {
    pub fn builder() -> ListEventsQueryRequestBuilder {
        <ListEventsQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ListEventsQueryRequestBuilder {
    limit: Option<i64>,
}

impl ListEventsQueryRequestBuilder {
    pub fn limit(mut self, value: i64) -> Self {
        self.limit = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ListEventsQueryRequest`].
    pub fn build(self) -> Result<ListEventsQueryRequest, BuildError> {
        Ok(ListEventsQueryRequest { limit: self.limit })
    }
}
