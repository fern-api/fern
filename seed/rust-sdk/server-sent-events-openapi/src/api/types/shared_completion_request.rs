pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct SharedCompletionRequest {
    /// The prompt to complete.
    #[serde(default)]
    pub prompt: String,
    /// The model to use.
    #[serde(default)]
    pub model: String,
    /// Whether to stream the response.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stream: Option<bool>,
}

impl SharedCompletionRequest {
    pub fn builder() -> SharedCompletionRequestBuilder {
        <SharedCompletionRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SharedCompletionRequestBuilder {
    prompt: Option<String>,
    model: Option<String>,
    stream: Option<bool>,
}

impl SharedCompletionRequestBuilder {
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

    /// Consumes the builder and constructs a [`SharedCompletionRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`prompt`](SharedCompletionRequestBuilder::prompt)
    /// - [`model`](SharedCompletionRequestBuilder::model)
    pub fn build(self) -> Result<SharedCompletionRequest, BuildError> {
        Ok(SharedCompletionRequest {
            prompt: self
                .prompt
                .ok_or_else(|| BuildError::missing_field("prompt"))?,
            model: self
                .model
                .ok_or_else(|| BuildError::missing_field("model"))?,
            stream: self.stream,
        })
    }
}
