pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct JustfileRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)]
    #[serde(with = "crate::core::base64_bytes::option")]
    pub file: Option<Vec<u8>>,
}
impl JustfileRequest {
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

    form
}
}

impl JustfileRequest {
    pub fn builder() -> JustfileRequestBuilder {
        <JustfileRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct JustfileRequestBuilder {
    file: Option<Vec<u8>>,
}

impl JustfileRequestBuilder {
    pub fn file(mut self, value: Vec<u8>) -> Self {
        self.file = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`JustfileRequest`].
    pub fn build(self) -> Result<JustfileRequest, BuildError> {
        Ok(JustfileRequest {
            file: self.file,
        })
    }
}
