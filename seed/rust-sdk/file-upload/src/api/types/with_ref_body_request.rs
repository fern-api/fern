pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct WithRefBodyRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)]
    #[serde(with = "crate::core::base64_bytes::option")]
    pub image_file: Option<Vec<u8>>,
    #[serde(default)]
    pub request: MyObject,
}
impl WithRefBodyRequest {
    pub fn to_multipart(self) -> reqwest::multipart::Form {
        let mut form = reqwest::multipart::Form::new();

        if let Some(ref file_data) = self.image_file {
            form = form.part(
                "image_file",
                reqwest::multipart::Part::bytes(file_data.clone())
                    .file_name("image_file")
                    .mime_str("application/octet-stream")
                    .unwrap(),
            );
        }

        if let Ok(json_str) = serde_json::to_string(&self.request) {
            form = form.text("request", json_str);
        }

        form
    }
}

impl WithRefBodyRequest {
    pub fn builder() -> WithRefBodyRequestBuilder {
        <WithRefBodyRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct WithRefBodyRequestBuilder {
    image_file: Option<Vec<u8>>,
    request: Option<MyObject>,
}

impl WithRefBodyRequestBuilder {
    pub fn image_file(mut self, value: Vec<u8>) -> Self {
        self.image_file = Some(value);
        self
    }

    pub fn request(mut self, value: MyObject) -> Self {
        self.request = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`WithRefBodyRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`request`](WithRefBodyRequestBuilder::request)
    pub fn build(self) -> Result<WithRefBodyRequest, BuildError> {
        Ok(WithRefBodyRequest {
            image_file: self.image_file,
            request: self
                .request
                .ok_or_else(|| BuildError::missing_field("request"))?,
        })
    }
}
