pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct SpeechToSpeechRequest {
    #[serde(default)]
    pub audio_data: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub model_id: Option<String>,
}

impl SpeechToSpeechRequest {
    pub fn builder() -> SpeechToSpeechRequestBuilder {
        <SpeechToSpeechRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SpeechToSpeechRequestBuilder {
    audio_data: Option<String>,
    model_id: Option<String>,
}

impl SpeechToSpeechRequestBuilder {
    pub fn audio_data(mut self, value: impl Into<String>) -> Self {
        self.audio_data = Some(value.into());
        self
    }

    pub fn model_id(mut self, value: impl Into<String>) -> Self {
        self.model_id = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`SpeechToSpeechRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`audio_data`](SpeechToSpeechRequestBuilder::audio_data)
    pub fn build(self) -> Result<SpeechToSpeechRequest, BuildError> {
        Ok(SpeechToSpeechRequest {
            audio_data: self
                .audio_data
                .ok_or_else(|| BuildError::missing_field("audio_data"))?,
            model_id: self.model_id,
        })
    }
}
