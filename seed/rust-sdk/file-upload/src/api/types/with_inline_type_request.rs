pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct WithInlineTypeRequest {
    #[serde(default)]
    #[serde(with = "crate::core::base64_bytes")]
    pub file: Vec<u8>,
    #[serde(default)]
    pub request: MyInlineType,
}
impl WithInlineTypeRequest {
    pub fn to_multipart(self) -> reqwest::multipart::Form {
        let mut form = reqwest::multipart::Form::new();

        form = form.part(
            "file",
            reqwest::multipart::Part::bytes(self.file.clone())
                .file_name("file")
                .mime_str("application/octet-stream")
                .unwrap(),
        );

        if let Ok(json_str) = serde_json::to_string(&self.request) {
            form = form.text("request", json_str);
        }

        form
    }
}

impl WithInlineTypeRequest {
    pub fn builder() -> WithInlineTypeRequestBuilder {
        <WithInlineTypeRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct WithInlineTypeRequestBuilder {
    file: Option<Vec<u8>>,
    request: Option<MyInlineType>,
}

impl WithInlineTypeRequestBuilder {
    pub fn file(mut self, value: Vec<u8>) -> Self {
        self.file = Some(value);
        self
    }

    pub fn request(mut self, value: MyInlineType) -> Self {
        self.request = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`WithInlineTypeRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`file`](WithInlineTypeRequestBuilder::file)
    /// - [`request`](WithInlineTypeRequestBuilder::request)
    pub fn build(self) -> Result<WithInlineTypeRequest, BuildError> {
        Ok(WithInlineTypeRequest {
            file: self.file.ok_or_else(|| BuildError::missing_field("file"))?,
            request: self
                .request
                .ok_or_else(|| BuildError::missing_field("request"))?,
        })
    }
}
