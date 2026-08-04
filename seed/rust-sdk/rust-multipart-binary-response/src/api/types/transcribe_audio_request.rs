pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct TranscribeAudioRequest {
    #[serde(default)]
    #[serde(with = "crate::core::base64_bytes")]
    pub audio: Vec<u8>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub model_id: Option<String>,
    #[serde(skip)]
    pub language: Option<String>,
}
impl TranscribeAudioRequest {
    pub fn to_multipart(self) -> reqwest::multipart::Form {
        let mut form = reqwest::multipart::Form::new();

        form = form.part(
            "audio",
            reqwest::multipart::Part::bytes(self.audio.clone())
                .file_name("audio")
                .mime_str("application/octet-stream")
                .unwrap(),
        );

        if let Some(ref value) = self.model_id {
            if let Ok(json_str) = serde_json::to_string(value) {
                form = form.text("model_id", json_str);
            }
        }

        form
    }
}

impl TranscribeAudioRequest {
    pub fn builder() -> TranscribeAudioRequestBuilder {
        <TranscribeAudioRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TranscribeAudioRequestBuilder {
    audio: Option<Vec<u8>>,
    model_id: Option<String>,
    language: Option<String>,
}

impl TranscribeAudioRequestBuilder {
    pub fn audio(mut self, value: Vec<u8>) -> Self {
        self.audio = Some(value);
        self
    }

    pub fn model_id(mut self, value: impl Into<String>) -> Self {
        self.model_id = Some(value.into());
        self
    }

    pub fn language(mut self, value: impl Into<String>) -> Self {
        self.language = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`TranscribeAudioRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`audio`](TranscribeAudioRequestBuilder::audio)
    pub fn build(self) -> Result<TranscribeAudioRequest, BuildError> {
        Ok(TranscribeAudioRequest {
            audio: self
                .audio
                .ok_or_else(|| BuildError::missing_field("audio"))?,
            model_id: self.model_id,
            language: self.language,
        })
    }
}
