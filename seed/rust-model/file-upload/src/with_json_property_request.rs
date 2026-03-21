pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct WithJsonPropertyRequest {
    #[serde(default)]
    #[serde(with = "crate::core::base64_bytes")]
    pub file: Vec<u8>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub json: Option<MyObject>,
}
impl WithJsonPropertyRequest {
    pub fn to_multipart(self) -> reqwest::multipart::Form {
    let mut form = reqwest::multipart::Form::new();

    form = form.part(
        "file",
        reqwest::multipart::Part::bytes(self.file.clone())
            .file_name("file")
            .mime_str("application/octet-stream").unwrap()
    );

    if let Some(ref value) = self.json {
        if let Ok(json_str) = serde_json::to_string(value) {
            form = form.text("json", json_str);
        }
    }

    form
}
}

impl WithJsonPropertyRequest {
    pub fn builder() -> WithJsonPropertyRequestBuilder {
        WithJsonPropertyRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct WithJsonPropertyRequestBuilder {
    file: Option<Vec<u8>>,
    json: Option<MyObject>,
}

impl WithJsonPropertyRequestBuilder {
    pub fn file(mut self, value: Vec<u8>) -> Self {
        self.file = Some(value);
        self
    }

    pub fn json(mut self, value: MyObject) -> Self {
        self.json = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`WithJsonPropertyRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`file`](WithJsonPropertyRequestBuilder::file)
    pub fn build(self) -> Result<WithJsonPropertyRequest, BuildError> {
        Ok(WithJsonPropertyRequest {
            file: self.file.ok_or_else(|| BuildError::missing_field("file"))?,
            json: self.json,
        })
    }
}
