pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct TranscriptEvent {
    pub r#type: String,
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
    r#type: Option<String>,
    data: Option<String>,
}

impl TranscriptEventBuilder {
    pub fn r#type(mut self, value: impl Into<String>) -> Self {
        self.r#type = Some(value.into());
        self
    }

    pub fn data(mut self, value: impl Into<String>) -> Self {
        self.data = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`TranscriptEvent`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](TranscriptEventBuilder::r#type)
    /// - [`data`](TranscriptEventBuilder::data)
    pub fn build(self) -> Result<TranscriptEvent, BuildError> {
        Ok(TranscriptEvent {
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
            data: self.data.ok_or_else(|| BuildError::missing_field("data"))?,
        })
    }
}
