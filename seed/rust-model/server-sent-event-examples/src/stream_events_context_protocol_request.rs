pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct StreamEventsContextProtocolRequest {
    #[serde(default)]
    pub query: String,
}

impl StreamEventsContextProtocolRequest {
    pub fn builder() -> StreamEventsContextProtocolRequestBuilder {
        StreamEventsContextProtocolRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct StreamEventsContextProtocolRequestBuilder {
    query: Option<String>,
}

impl StreamEventsContextProtocolRequestBuilder {
    pub fn query(mut self, value: impl Into<String>) -> Self {
        self.query = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`StreamEventsContextProtocolRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`query`](StreamEventsContextProtocolRequestBuilder::query)
    pub fn build(self) -> Result<StreamEventsContextProtocolRequest, BuildError> {
        Ok(StreamEventsContextProtocolRequest {
            query: self.query.ok_or_else(|| BuildError::missing_field("query"))?,
        })
    }
}

