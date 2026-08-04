pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct TranscriptionResult {
    #[serde(default)]
    pub text: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub language: Option<String>,
}

impl TranscriptionResult {
    pub fn builder() -> TranscriptionResultBuilder {
        <TranscriptionResultBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TranscriptionResultBuilder {
    text: Option<String>,
    language: Option<String>,
}

impl TranscriptionResultBuilder {
    pub fn text(mut self, value: impl Into<String>) -> Self {
        self.text = Some(value.into());
        self
    }

    pub fn language(mut self, value: impl Into<String>) -> Self {
        self.language = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`TranscriptionResult`].
    /// This method will fail if any of the following fields are not set:
    /// - [`text`](TranscriptionResultBuilder::text)
    pub fn build(self) -> Result<TranscriptionResult, BuildError> {
        Ok(TranscriptionResult {
            text: self.text.ok_or_else(|| BuildError::missing_field("text"))?,
            language: self.language,
        })
    }
}
