pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct StreamedCompletion {
    #[serde(default)]
    pub delta: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tokens: Option<i64>,
}

impl StreamedCompletion {
    pub fn builder() -> StreamedCompletionBuilder {
        StreamedCompletionBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct StreamedCompletionBuilder {
    delta: Option<String>,
    tokens: Option<i64>,
}

impl StreamedCompletionBuilder {
    pub fn delta(mut self, value: impl Into<String>) -> Self {
        self.delta = Some(value.into());
        self
    }

    pub fn tokens(mut self, value: i64) -> Self {
        self.tokens = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`StreamedCompletion`].
    /// This method will fail if any of the following fields are not set:
    /// - [`delta`](StreamedCompletionBuilder::delta)
    pub fn build(self) -> Result<StreamedCompletion, BuildError> {
        Ok(StreamedCompletion {
            delta: self
                .delta
                .ok_or_else(|| BuildError::missing_field("delta"))?,
            tokens: self.tokens,
        })
    }
}
