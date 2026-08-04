pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct IsolateAudioRequest {
    #[serde(default)]
    #[serde(with = "crate::core::base64_bytes")]
    pub audio: Vec<u8>,
}
impl IsolateAudioRequest {
    pub fn to_multipart(self) -> reqwest::multipart::Form {
        let mut form = reqwest::multipart::Form::new();

        form = form.part(
            "audio",
            reqwest::multipart::Part::bytes(self.audio.clone())
                .file_name("audio")
                .mime_str("application/octet-stream")
                .unwrap(),
        );

        form
    }
}

impl IsolateAudioRequest {
    pub fn builder() -> IsolateAudioRequestBuilder {
        <IsolateAudioRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct IsolateAudioRequestBuilder {
    audio: Option<Vec<u8>>,
}

impl IsolateAudioRequestBuilder {
    pub fn audio(mut self, value: Vec<u8>) -> Self {
        self.audio = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`IsolateAudioRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`audio`](IsolateAudioRequestBuilder::audio)
    pub fn build(self) -> Result<IsolateAudioRequest, BuildError> {
        Ok(IsolateAudioRequest {
            audio: self
                .audio
                .ok_or_else(|| BuildError::missing_field("audio"))?,
        })
    }
}
