pub use crate::prelude::*;

/// A single chunk in a streamed completion response.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct CompletionStreamChunk {
    /// The incremental text chunk.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub delta: Option<String>,
    /// Number of tokens in this chunk.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tokens: Option<i64>,
}

impl CompletionStreamChunk {
    pub fn builder() -> CompletionStreamChunkBuilder {
        <CompletionStreamChunkBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CompletionStreamChunkBuilder {
    delta: Option<String>,
    tokens: Option<i64>,
}

impl CompletionStreamChunkBuilder {
    pub fn delta(mut self, value: impl Into<String>) -> Self {
        self.delta = Some(value.into());
        self
    }

    pub fn tokens(mut self, value: i64) -> Self {
        self.tokens = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`CompletionStreamChunk`].
    pub fn build(self) -> Result<CompletionStreamChunk, BuildError> {
        Ok(CompletionStreamChunk {
            delta: self.delta,
            tokens: self.tokens,
        })
    }
}
