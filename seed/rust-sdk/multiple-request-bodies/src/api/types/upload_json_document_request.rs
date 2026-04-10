pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UploadJsonDocumentRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub author: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tags: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
}

impl UploadJsonDocumentRequest {
    pub fn builder() -> UploadJsonDocumentRequestBuilder {
        <UploadJsonDocumentRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UploadJsonDocumentRequestBuilder {
    author: Option<String>,
    tags: Option<Vec<String>>,
    title: Option<String>,
}

impl UploadJsonDocumentRequestBuilder {
    pub fn author(mut self, value: impl Into<String>) -> Self {
        self.author = Some(value.into());
        self
    }

    pub fn tags(mut self, value: Vec<String>) -> Self {
        self.tags = Some(value);
        self
    }

    pub fn title(mut self, value: impl Into<String>) -> Self {
        self.title = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`UploadJsonDocumentRequest`].
    pub fn build(self) -> Result<UploadJsonDocumentRequest, BuildError> {
        Ok(UploadJsonDocumentRequest {
            author: self.author,
            tags: self.tags,
            title: self.title,
        })
    }
}

