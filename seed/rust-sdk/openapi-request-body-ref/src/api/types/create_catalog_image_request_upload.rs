pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct CreateCatalogImageRequest2 {
    #[serde(default)]
    pub request: CreateCatalogImageRequest,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)]
    #[serde(with = "crate::core::base64_bytes::option")]
    pub image_file: Option<Vec<u8>>,
}
impl CreateCatalogImageRequest2 {
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

impl CreateCatalogImageRequest2 {
    pub fn builder() -> CreateCatalogImageRequest2Builder {
        <CreateCatalogImageRequest2Builder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CreateCatalogImageRequest2Builder {
    request: Option<CreateCatalogImageRequest>,
    image_file: Option<Vec<u8>>,
}

impl CreateCatalogImageRequest2Builder {
    pub fn request(mut self, value: CreateCatalogImageRequest) -> Self {
        self.request = Some(value);
        self
    }

    pub fn image_file(mut self, value: Vec<u8>) -> Self {
        self.image_file = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`CreateCatalogImageRequest2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`request`](CreateCatalogImageRequest2Builder::request)
    pub fn build(self) -> Result<CreateCatalogImageRequest2, BuildError> {
        Ok(CreateCatalogImageRequest2 {
            request: self
                .request
                .ok_or_else(|| BuildError::missing_field("request"))?,
            image_file: self.image_file,
        })
    }
}
