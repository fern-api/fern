pub use crate::prelude::*;

/// Full response returned when streaming is disabled.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct CompletionFullResponse {
    /// The complete generated answer.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub answer: Option<String>,
    /// Why generation stopped.
    #[serde(rename = "finishReason")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub finish_reason: Option<CompletionFullResponseFinishReason>,
}

impl CompletionFullResponse {
    pub fn builder() -> CompletionFullResponseBuilder {
        <CompletionFullResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CompletionFullResponseBuilder {
    answer: Option<String>,
    finish_reason: Option<CompletionFullResponseFinishReason>,
}

impl CompletionFullResponseBuilder {
    pub fn answer(mut self, value: impl Into<String>) -> Self {
        self.answer = Some(value.into());
        self
    }

    pub fn finish_reason(mut self, value: CompletionFullResponseFinishReason) -> Self {
        self.finish_reason = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`CompletionFullResponse`].
    pub fn build(self) -> Result<CompletionFullResponse, BuildError> {
        Ok(CompletionFullResponse {
            answer: self.answer,
            finish_reason: self.finish_reason,
        })
    }
}
