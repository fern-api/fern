pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct JustFileRequest {
    #[serde(default)]
    #[serde(with = "crate::core::base64_bytes")]
    pub file: Vec<u8>,
}
impl JustFileRequest {
    pub fn to_multipart(self) -> reqwest::multipart::Form {
        let mut form = reqwest::multipart::Form::new();

        form = form.part(
            "file",
            reqwest::multipart::Part::bytes(self.file.clone())
                .file_name("file")
                .mime_str("application/octet-stream")
                .unwrap(),
        );

        form
    }
}

impl JustFileRequest {
    pub fn builder() -> JustFileRequestBuilder {
        JustFileRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct JustFileRequestBuilder {
    file: Option<Vec<u8>>,
}

impl JustFileRequestBuilder {
    pub fn file(mut self, value: Vec<u8>) -> Self {
        self.file = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`JustFileRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`file`](JustFileRequestBuilder::file)
    pub fn build(self) -> Result<JustFileRequest, BuildError> {
        Ok(JustFileRequest {
            file: self.file.ok_or_else(|| BuildError::missing_field("file"))?,
        })
    }
}
