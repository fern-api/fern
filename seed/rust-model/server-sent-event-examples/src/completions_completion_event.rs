pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct CompletionEvent {
    #[serde(default)]
    pub content: String,
}

impl CompletionEvent {
    pub fn builder() -> CompletionEventBuilder {
        CompletionEventBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CompletionEventBuilder {
    content: Option<String>,
}

impl CompletionEventBuilder {
    pub fn content(mut self, value: impl Into<String>) -> Self {
        self.content = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`CompletionEvent`].
    /// This method will fail if any of the following fields are not set:
    /// - [`content`](CompletionEventBuilder::content)
    pub fn build(self) -> Result<CompletionEvent, BuildError> {
        Ok(CompletionEvent {
            content: self.content.ok_or_else(|| BuildError::missing_field("content"))?,
        })
    }
}
