pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UploadFileRequest {
    #[serde(default)]
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)]
    #[serde(with = "crate::core::base64_bytes::option")]
    pub file: Option<Vec<u8>>,
}
impl UploadFileRequest {
    pub fn to_multipart(self) -> reqwest::multipart::Form {
    let mut form = reqwest::multipart::Form::new();

    if let Some(ref file_data) = self.file {
        form = form.part(
            "file",
            reqwest::multipart::Part::bytes(file_data.clone())
                .file_name("file")
                .mime_str("application/octet-stream").unwrap()
        );
    }

    if let Ok(json_str) = serde_json::to_string(&self.name) {
        form = form.text("name", json_str);
    }

    form
}
}

impl UploadFileRequest {
    pub fn builder() -> UploadFileRequestBuilder {
        UploadFileRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UploadFileRequestBuilder {
    name: Option<String>,
    file: Option<Vec<u8>>,
}

impl UploadFileRequestBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn file(mut self, value: Vec<u8>) -> Self {
        self.file = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UploadFileRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](UploadFileRequestBuilder::name)
    pub fn build(self) -> Result<UploadFileRequest, BuildError> {
        Ok(UploadFileRequest {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            file: self.file,
        })
    }
}
