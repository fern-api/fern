pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct StreamXFernStreamingConditionRequest {
    /// The prompt or query to complete.
    #[serde(default)]
    pub query: String,
    /// Whether to stream the response.
    pub stream: bool,
}

impl StreamXFernStreamingConditionRequest {
    pub fn builder() -> StreamXFernStreamingConditionRequestBuilder {
        <StreamXFernStreamingConditionRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct StreamXFernStreamingConditionRequestBuilder {
    query: Option<String>,
    stream: Option<bool>,
}

impl StreamXFernStreamingConditionRequestBuilder {
    pub fn query(mut self, value: impl Into<String>) -> Self {
        self.query = Some(value.into());
        self
    }

    pub fn stream(mut self, value: bool) -> Self {
        self.stream = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`StreamXFernStreamingConditionRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`query`](StreamXFernStreamingConditionRequestBuilder::query)
    /// - [`stream`](StreamXFernStreamingConditionRequestBuilder::stream)
    pub fn build(self) -> Result<StreamXFernStreamingConditionRequest, BuildError> {
        Ok(StreamXFernStreamingConditionRequest {
            query: self.query.ok_or_else(|| BuildError::missing_field("query"))?,
            stream: self.stream.ok_or_else(|| BuildError::missing_field("stream"))?,
        })
    }
}

