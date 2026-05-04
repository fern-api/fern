pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UploadWithQueryParamsRequest {
    #[serde(skip_serializing)]
    #[serde(default)]
    pub body: Vec<u8>,
    /// The model to use for processing
    #[serde(skip_serializing)]
    #[serde(default)]
    pub model: String,
    /// The language of the content
    #[serde(skip_serializing)]
    pub language: Option<String>,
}

impl UploadWithQueryParamsRequest {
    pub fn builder() -> UploadWithQueryParamsRequestBuilder {
        <UploadWithQueryParamsRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UploadWithQueryParamsRequestBuilder {
    body: Option<Vec<u8>>,
    model: Option<String>,
    language: Option<String>,
}

impl UploadWithQueryParamsRequestBuilder {
    pub fn body(mut self, value: Vec<u8>) -> Self {
        self.body = Some(value);
        self
    }

    pub fn model(mut self, value: impl Into<String>) -> Self {
        self.model = Some(value.into());
        self
    }

    pub fn language(mut self, value: impl Into<String>) -> Self {
        self.language = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`UploadWithQueryParamsRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`body`](UploadWithQueryParamsRequestBuilder::body)
    /// - [`model`](UploadWithQueryParamsRequestBuilder::model)
    pub fn build(self) -> Result<UploadWithQueryParamsRequest, BuildError> {
        Ok(UploadWithQueryParamsRequest {
            body: self.body.ok_or_else(|| BuildError::missing_field("body"))?,
            model: self
                .model
                .ok_or_else(|| BuildError::missing_field("model"))?,
            language: self.language,
        })
    }
}
