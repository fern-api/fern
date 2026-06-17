pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UploadBytesWithQueryRequest {
    #[serde(skip_serializing)]
    #[serde(default)]
    pub body: Vec<u8>,
    #[serde(rename = "_fields")]
    #[serde(skip_serializing)]
    pub fields: Option<String>,
}

impl UploadBytesWithQueryRequest {
    pub fn builder() -> UploadBytesWithQueryRequestBuilder {
        <UploadBytesWithQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UploadBytesWithQueryRequestBuilder {
    body: Option<Vec<u8>>,
    fields: Option<String>,
}

impl UploadBytesWithQueryRequestBuilder {
    pub fn body(mut self, value: Vec<u8>) -> Self {
        self.body = Some(value);
        self
    }

    pub fn fields(mut self, value: impl Into<String>) -> Self {
        self.fields = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`UploadBytesWithQueryRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`body`](UploadBytesWithQueryRequestBuilder::body)
    pub fn build(self) -> Result<UploadBytesWithQueryRequest, BuildError> {
        Ok(UploadBytesWithQueryRequest {
            body: self.body.ok_or_else(|| BuildError::missing_field("body"))?,
            fields: self.fields,
        })
    }
}
