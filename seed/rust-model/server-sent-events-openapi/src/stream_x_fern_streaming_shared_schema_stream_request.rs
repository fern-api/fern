pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct StreamXFernStreamingSharedSchemaStreamRequest {
    /// The prompt to complete.
    #[serde(default)]
    pub prompt: String,
    /// The model to use.
    #[serde(default)]
    pub model: String,
    /// Whether to stream the response.
    pub stream: bool,
}

impl StreamXFernStreamingSharedSchemaStreamRequest {
    pub fn builder() -> StreamXFernStreamingSharedSchemaStreamRequestBuilder {
        <StreamXFernStreamingSharedSchemaStreamRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct StreamXFernStreamingSharedSchemaStreamRequestBuilder {
    prompt: Option<String>,
    model: Option<String>,
    stream: Option<bool>,
}

impl StreamXFernStreamingSharedSchemaStreamRequestBuilder {
    pub fn prompt(mut self, value: impl Into<String>) -> Self {
        self.prompt = Some(value.into());
        self
    }

    pub fn model(mut self, value: impl Into<String>) -> Self {
        self.model = Some(value.into());
        self
    }

    pub fn stream(mut self, value: bool) -> Self {
        self.stream = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`StreamXFernStreamingSharedSchemaStreamRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`prompt`](StreamXFernStreamingSharedSchemaStreamRequestBuilder::prompt)
    /// - [`model`](StreamXFernStreamingSharedSchemaStreamRequestBuilder::model)
    /// - [`stream`](StreamXFernStreamingSharedSchemaStreamRequestBuilder::stream)
    pub fn build(self) -> Result<StreamXFernStreamingSharedSchemaStreamRequest, BuildError> {
        Ok(StreamXFernStreamingSharedSchemaStreamRequest {
            prompt: self.prompt.ok_or_else(|| BuildError::missing_field("prompt"))?,
            model: self.model.ok_or_else(|| BuildError::missing_field("model"))?,
            stream: self.stream.ok_or_else(|| BuildError::missing_field("stream"))?,
        })
    }
}

