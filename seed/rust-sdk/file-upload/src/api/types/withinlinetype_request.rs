pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct WithinlinetypeRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)]
    #[serde(with = "crate::core::base64_bytes::option")]
    pub file: Option<Vec<u8>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub request: Option<MyInlineType>,
}
impl WithinlinetypeRequest {
    pub fn to_multipart(self) -> reqwest::multipart::Form {
        let mut form = reqwest::multipart::Form::new();

        if let Some(ref file_data) = self.file {
            form = form.part(
                "file",
                reqwest::multipart::Part::bytes(file_data.clone())
                    .file_name("file")
                    .mime_str("application/octet-stream")
                    .unwrap(),
            );
        }

        if let Some(ref value) = self.request {
            if let Ok(json_str) = serde_json::to_string(value) {
                form = form.text("request", json_str);
            }
        }

        form
    }
}

impl WithinlinetypeRequest {
    pub fn builder() -> WithinlinetypeRequestBuilder {
        <WithinlinetypeRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct WithinlinetypeRequestBuilder {
    file: Option<Vec<u8>>,
    request: Option<MyInlineType>,
}

impl WithinlinetypeRequestBuilder {
    pub fn file(mut self, value: Vec<u8>) -> Self {
        self.file = Some(value);
        self
    }

    pub fn request(mut self, value: MyInlineType) -> Self {
        self.request = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`WithinlinetypeRequest`].
    pub fn build(self) -> Result<WithinlinetypeRequest, BuildError> {
        Ok(WithinlinetypeRequest {
            file: self.file,
            request: self.request,
        })
    }
}
