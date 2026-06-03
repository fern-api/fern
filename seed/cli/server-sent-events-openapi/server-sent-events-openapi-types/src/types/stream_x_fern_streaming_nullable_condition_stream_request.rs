pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct StreamXFernStreamingNullableConditionStreamRequest {
    /// The prompt or query to complete.
    #[serde(default)]
    pub query: String,
    /// Whether to stream the response. This field is nullable (OAS 3.1 type array), which previously caused the const literal to be overwritten by the nullable type during spread in the importer.
    pub stream: bool,
}

impl StreamXFernStreamingNullableConditionStreamRequest {
    pub fn builder() -> StreamXFernStreamingNullableConditionStreamRequestBuilder {
        <StreamXFernStreamingNullableConditionStreamRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct StreamXFernStreamingNullableConditionStreamRequestBuilder {
    query: Option<String>,
    stream: Option<bool>,
}

impl StreamXFernStreamingNullableConditionStreamRequestBuilder {
    pub fn query(mut self, value: impl Into<String>) -> Self {
        self.query = Some(value.into());
        self
    }

    pub fn stream(mut self, value: bool) -> Self {
        self.stream = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`StreamXFernStreamingNullableConditionStreamRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`query`](StreamXFernStreamingNullableConditionStreamRequestBuilder::query)
    /// - [`stream`](StreamXFernStreamingNullableConditionStreamRequestBuilder::stream)
    pub fn build(self) -> Result<StreamXFernStreamingNullableConditionStreamRequest, BuildError> {
        Ok(StreamXFernStreamingNullableConditionStreamRequest {
            query: self.query.ok_or_else(|| BuildError::missing_field("query"))?,
            stream: self.stream.ok_or_else(|| BuildError::missing_field("stream"))?,
        })
    }
}

