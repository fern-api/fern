pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct StreamEventsDiscriminantInDataRequest {
    #[serde(default)]
    pub query: String,
}

impl StreamEventsDiscriminantInDataRequest {
    pub fn builder() -> StreamEventsDiscriminantInDataRequestBuilder {
        <StreamEventsDiscriminantInDataRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct StreamEventsDiscriminantInDataRequestBuilder {
    query: Option<String>,
}

impl StreamEventsDiscriminantInDataRequestBuilder {
    pub fn query(mut self, value: impl Into<String>) -> Self {
        self.query = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`StreamEventsDiscriminantInDataRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`query`](StreamEventsDiscriminantInDataRequestBuilder::query)
    pub fn build(self) -> Result<StreamEventsDiscriminantInDataRequest, BuildError> {
        Ok(StreamEventsDiscriminantInDataRequest {
            query: self
                .query
                .ok_or_else(|| BuildError::missing_field("query"))?,
        })
    }
}
