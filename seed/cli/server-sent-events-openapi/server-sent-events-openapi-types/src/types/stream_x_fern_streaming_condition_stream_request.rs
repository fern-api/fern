pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct StreamXFernStreamingConditionStreamRequest {
    /// The prompt or query to complete.
    #[serde(default)]
    pub query: String,
    /// Whether to stream the response.
    pub stream: bool,
}

impl StreamXFernStreamingConditionStreamRequest {
    pub fn builder() -> StreamXFernStreamingConditionStreamRequestBuilder {
        <StreamXFernStreamingConditionStreamRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct StreamXFernStreamingConditionStreamRequestBuilder {
    query: Option<String>,
    stream: Option<bool>,
}

impl StreamXFernStreamingConditionStreamRequestBuilder {
    pub fn query(mut self, value: impl Into<String>) -> Self {
        self.query = Some(value.into());
        self
    }

    pub fn stream(mut self, value: bool) -> Self {
        self.stream = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`StreamXFernStreamingConditionStreamRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`query`](StreamXFernStreamingConditionStreamRequestBuilder::query)
    /// - [`stream`](StreamXFernStreamingConditionStreamRequestBuilder::stream)
    pub fn build(self) -> Result<StreamXFernStreamingConditionStreamRequest, BuildError> {
        Ok(StreamXFernStreamingConditionStreamRequest {
            query: self.query.ok_or_else(|| BuildError::missing_field("query"))?,
            stream: self.stream.ok_or_else(|| BuildError::missing_field("stream"))?,
        })
    }
}

