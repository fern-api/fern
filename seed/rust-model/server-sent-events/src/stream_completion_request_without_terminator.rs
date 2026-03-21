pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct StreamCompletionRequestWithoutTerminator {
    #[serde(default)]
    pub query: String,
}

impl StreamCompletionRequestWithoutTerminator {
    pub fn builder() -> StreamCompletionRequestWithoutTerminatorBuilder {
        StreamCompletionRequestWithoutTerminatorBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct StreamCompletionRequestWithoutTerminatorBuilder {
    query: Option<String>,
}

impl StreamCompletionRequestWithoutTerminatorBuilder {
    pub fn query(mut self, value: impl Into<String>) -> Self {
        self.query = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`StreamCompletionRequestWithoutTerminator`].
    /// This method will fail if any of the following fields are not set:
    /// - [`query`](StreamCompletionRequestWithoutTerminatorBuilder::query)
    pub fn build(self) -> Result<StreamCompletionRequestWithoutTerminator, BuildError> {
        Ok(StreamCompletionRequestWithoutTerminator {
            query: self.query.ok_or_else(|| BuildError::missing_field("query"))?,
        })
    }
}

