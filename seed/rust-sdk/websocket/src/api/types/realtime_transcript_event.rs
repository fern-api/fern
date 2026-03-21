pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct TranscriptEvent {
    #[serde(default)]
    pub data: String,
}

impl TranscriptEvent {
    pub fn builder() -> TranscriptEventBuilder {
        TranscriptEventBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TranscriptEventBuilder {
    data: Option<String>,
}

impl TranscriptEventBuilder {
    pub fn data(mut self, value: impl Into<String>) -> Self {
        self.data = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`TranscriptEvent`].
    /// This method will fail if any of the following fields are not set:
    /// - [`data`](TranscriptEventBuilder::data)
    pub fn build(self) -> Result<TranscriptEvent, BuildError> {
        Ok(TranscriptEvent {
            data: self.data.ok_or_else(|| BuildError::missing_field("data"))?,
        })
    }
}
