pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct CompletionRequest {
    /// The prompt or query to complete.
    #[serde(default)]
    pub query: String,
    /// Whether to stream the response.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stream: Option<bool>,
}

impl CompletionRequest {
    pub fn builder() -> CompletionRequestBuilder {
        <CompletionRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CompletionRequestBuilder {
    query: Option<String>,
    stream: Option<bool>,
}

impl CompletionRequestBuilder {
    pub fn query(mut self, value: impl Into<String>) -> Self {
        self.query = Some(value.into());
        self
    }

    pub fn stream(mut self, value: bool) -> Self {
        self.stream = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`CompletionRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`query`](CompletionRequestBuilder::query)
    pub fn build(self) -> Result<CompletionRequest, BuildError> {
        Ok(CompletionRequest {
            query: self
                .query
                .ok_or_else(|| BuildError::missing_field("query"))?,
            stream: self.stream,
        })
    }
}
