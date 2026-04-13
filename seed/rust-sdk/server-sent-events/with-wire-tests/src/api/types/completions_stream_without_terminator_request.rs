pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct CompletionsStreamWithoutTerminatorRequest {
    #[serde(default)]
    pub query: String,
}

impl CompletionsStreamWithoutTerminatorRequest {
    pub fn builder() -> CompletionsStreamWithoutTerminatorRequestBuilder {
        <CompletionsStreamWithoutTerminatorRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CompletionsStreamWithoutTerminatorRequestBuilder {
    query: Option<String>,
}

impl CompletionsStreamWithoutTerminatorRequestBuilder {
    pub fn query(mut self, value: impl Into<String>) -> Self {
        self.query = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`CompletionsStreamWithoutTerminatorRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`query`](CompletionsStreamWithoutTerminatorRequestBuilder::query)
    pub fn build(self) -> Result<CompletionsStreamWithoutTerminatorRequest, BuildError> {
        Ok(CompletionsStreamWithoutTerminatorRequest {
            query: self
                .query
                .ok_or_else(|| BuildError::missing_field("query"))?,
        })
    }
}
