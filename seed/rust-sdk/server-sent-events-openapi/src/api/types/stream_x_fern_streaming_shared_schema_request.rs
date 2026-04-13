pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct StreamXFernStreamingSharedSchemaRequest {
    /// The prompt to complete.
    #[serde(default)]
    pub prompt: String,
    /// The model to use.
    #[serde(default)]
    pub model: String,
    /// Whether to stream the response.
    pub stream: bool,
}

impl StreamXFernStreamingSharedSchemaRequest {
    pub fn builder() -> StreamXFernStreamingSharedSchemaRequestBuilder {
        <StreamXFernStreamingSharedSchemaRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct StreamXFernStreamingSharedSchemaRequestBuilder {
    prompt: Option<String>,
    model: Option<String>,
    stream: Option<bool>,
}

impl StreamXFernStreamingSharedSchemaRequestBuilder {
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

    /// Consumes the builder and constructs a [`StreamXFernStreamingSharedSchemaRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`prompt`](StreamXFernStreamingSharedSchemaRequestBuilder::prompt)
    /// - [`model`](StreamXFernStreamingSharedSchemaRequestBuilder::model)
    /// - [`stream`](StreamXFernStreamingSharedSchemaRequestBuilder::stream)
    pub fn build(self) -> Result<StreamXFernStreamingSharedSchemaRequest, BuildError> {
        Ok(StreamXFernStreamingSharedSchemaRequest {
            prompt: self
                .prompt
                .ok_or_else(|| BuildError::missing_field("prompt"))?,
            model: self
                .model
                .ok_or_else(|| BuildError::missing_field("model"))?,
            stream: self
                .stream
                .ok_or_else(|| BuildError::missing_field("stream"))?,
        })
    }
}
