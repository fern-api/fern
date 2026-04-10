pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct CompletionsStreamRequest {
    #[serde(default)]
    pub query: String,
}

impl CompletionsStreamRequest {
    pub fn builder() -> CompletionsStreamRequestBuilder {
        <CompletionsStreamRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CompletionsStreamRequestBuilder {
    query: Option<String>,
}

impl CompletionsStreamRequestBuilder {
    pub fn query(mut self, value: impl Into<String>) -> Self {
        self.query = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`CompletionsStreamRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`query`](CompletionsStreamRequestBuilder::query)
    pub fn build(self) -> Result<CompletionsStreamRequest, BuildError> {
        Ok(CompletionsStreamRequest {
            query: self
                .query
                .ok_or_else(|| BuildError::missing_field("query"))?,
        })
    }
}
