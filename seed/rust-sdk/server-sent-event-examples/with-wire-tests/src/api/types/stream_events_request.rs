pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct StreamEventsRequest {
    #[serde(default)]
    pub query: String,
}

impl StreamEventsRequest {
    pub fn builder() -> StreamEventsRequestBuilder {
        <StreamEventsRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct StreamEventsRequestBuilder {
    query: Option<String>,
}

impl StreamEventsRequestBuilder {
    pub fn query(mut self, value: impl Into<String>) -> Self {
        self.query = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`StreamEventsRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`query`](StreamEventsRequestBuilder::query)
    pub fn build(self) -> Result<StreamEventsRequest, BuildError> {
        Ok(StreamEventsRequest {
            query: self
                .query
                .ok_or_else(|| BuildError::missing_field("query"))?,
        })
    }
}
