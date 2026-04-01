pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UploadDocumentRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub author: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tags: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
}

impl UploadDocumentRequest {
    pub fn builder() -> UploadDocumentRequestBuilder {
        <UploadDocumentRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UploadDocumentRequestBuilder {
    author: Option<String>,
    tags: Option<Vec<String>>,
    title: Option<String>,
}

impl UploadDocumentRequestBuilder {
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

    /// Consumes the builder and constructs a [`UploadDocumentRequest`].
    pub fn build(self) -> Result<UploadDocumentRequest, BuildError> {
        Ok(UploadDocumentRequest {
            author: self.author,
            tags: self.tags,
            title: self.title,
        })
    }
}

