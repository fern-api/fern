pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct StreamCompletionRequestNonResumable {
    #[serde(default)]
    pub query: String,
}

impl StreamCompletionRequestNonResumable {
    pub fn builder() -> StreamCompletionRequestNonResumableBuilder {
        <StreamCompletionRequestNonResumableBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct StreamCompletionRequestNonResumableBuilder {
    query: Option<String>,
}

impl StreamCompletionRequestNonResumableBuilder {
    pub fn query(mut self, value: impl Into<String>) -> Self {
        self.query = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`StreamCompletionRequestNonResumable`].
    /// This method will fail if any of the following fields are not set:
    /// - [`query`](StreamCompletionRequestNonResumableBuilder::query)
    pub fn build(self) -> Result<StreamCompletionRequestNonResumable, BuildError> {
        Ok(StreamCompletionRequestNonResumable {
            query: self
                .query
                .ok_or_else(|| BuildError::missing_field("query"))?,
        })
    }
}
