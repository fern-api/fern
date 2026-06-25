pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct SpeechToSpeechRequest2 {
    #[serde(default)]
    #[serde(with = "crate::core::base64_bytes")]
    pub audio: Vec<u8>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub model_id: Option<String>,
    #[serde(skip)]
    pub enable_logging: Option<bool>,
    #[serde(skip)]
    pub optimize_streaming_latency: Option<i64>,
    #[serde(skip)]
    #[serde(default)]
    pub output_format: String,
}
impl SpeechToSpeechRequest2 {
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

impl SpeechToSpeechRequest2 {
    pub fn builder() -> SpeechToSpeechRequest2Builder {
        <SpeechToSpeechRequest2Builder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SpeechToSpeechRequest2Builder {
    audio: Option<Vec<u8>>,
    model_id: Option<String>,
    enable_logging: Option<bool>,
    optimize_streaming_latency: Option<i64>,
    output_format: Option<String>,
}

impl SpeechToSpeechRequest2Builder {
    pub fn audio(mut self, value: Vec<u8>) -> Self {
        self.audio = Some(value);
        self
    }

    pub fn model_id(mut self, value: impl Into<String>) -> Self {
        self.model_id = Some(value.into());
        self
    }

    pub fn enable_logging(mut self, value: bool) -> Self {
        self.enable_logging = Some(value);
        self
    }

    pub fn optimize_streaming_latency(mut self, value: i64) -> Self {
        self.optimize_streaming_latency = Some(value);
        self
    }

    pub fn output_format(mut self, value: impl Into<String>) -> Self {
        self.output_format = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`SpeechToSpeechRequest2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`audio`](SpeechToSpeechRequest2Builder::audio)
    /// - [`output_format`](SpeechToSpeechRequest2Builder::output_format)
    pub fn build(self) -> Result<SpeechToSpeechRequest2, BuildError> {
        Ok(SpeechToSpeechRequest2 {
            audio: self
                .audio
                .ok_or_else(|| BuildError::missing_field("audio"))?,
            model_id: self.model_id,
            enable_logging: self.enable_logging,
            optimize_streaming_latency: self.optimize_streaming_latency,
            output_format: self
                .output_format
                .ok_or_else(|| BuildError::missing_field("output_format"))?,
        })
    }
}
