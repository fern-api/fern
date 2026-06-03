pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct StreamXFernStreamingNullableConditionRequest {
    /// The prompt or query to complete.
    #[serde(default)]
    pub query: String,
    /// Whether to stream the response. This field is nullable (OAS 3.1 type array), which previously caused the const literal to be overwritten by the nullable type during spread in the importer.
    pub stream: bool,
}

impl StreamXFernStreamingNullableConditionRequest {
    pub fn builder() -> StreamXFernStreamingNullableConditionRequestBuilder {
        <StreamXFernStreamingNullableConditionRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct StreamXFernStreamingNullableConditionRequestBuilder {
    query: Option<String>,
    stream: Option<bool>,
}

impl StreamXFernStreamingNullableConditionRequestBuilder {
    pub fn query(mut self, value: impl Into<String>) -> Self {
        self.query = Some(value.into());
        self
    }

    pub fn stream(mut self, value: bool) -> Self {
        self.stream = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`StreamXFernStreamingNullableConditionRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`query`](StreamXFernStreamingNullableConditionRequestBuilder::query)
    /// - [`stream`](StreamXFernStreamingNullableConditionRequestBuilder::stream)
    pub fn build(self) -> Result<StreamXFernStreamingNullableConditionRequest, BuildError> {
        Ok(StreamXFernStreamingNullableConditionRequest {
            query: self.query.ok_or_else(|| BuildError::missing_field("query"))?,
            stream: self.stream.ok_or_else(|| BuildError::missing_field("stream"))?,
        })
    }
}

