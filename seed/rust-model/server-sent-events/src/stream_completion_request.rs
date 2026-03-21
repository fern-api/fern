pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct StreamCompletionRequest {
    #[serde(default)]
    pub query: String,
}

impl StreamCompletionRequest {
    pub fn builder() -> StreamCompletionRequestBuilder {
        StreamCompletionRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct StreamCompletionRequestBuilder {
    query: Option<String>,
}

impl StreamCompletionRequestBuilder {
    pub fn query(mut self, value: impl Into<String>) -> Self {
        self.query = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`StreamCompletionRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`query`](StreamCompletionRequestBuilder::query)
    pub fn build(self) -> Result<StreamCompletionRequest, BuildError> {
        Ok(StreamCompletionRequest {
            query: self.query.ok_or_else(|| BuildError::missing_field("query"))?,
        })
    }
}

