pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct SpeechToSpeechRequest {
    #[serde(default)]
    pub voice_id: String,
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
    voice_id: Option<String>,
    model_id: Option<String>,
}

impl SpeechToSpeechRequestBuilder {
    pub fn voice_id(mut self, value: impl Into<String>) -> Self {
        self.voice_id = Some(value.into());
        self
    }

    pub fn model_id(mut self, value: impl Into<String>) -> Self {
        self.model_id = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`SpeechToSpeechRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`voice_id`](SpeechToSpeechRequestBuilder::voice_id)
    pub fn build(self) -> Result<SpeechToSpeechRequest, BuildError> {
        Ok(SpeechToSpeechRequest {
            voice_id: self
                .voice_id
                .ok_or_else(|| BuildError::missing_field("voice_id"))?,
            model_id: self.model_id,
        })
    }
}
