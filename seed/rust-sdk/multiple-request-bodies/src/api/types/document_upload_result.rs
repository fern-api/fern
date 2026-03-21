pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct DocumentUploadResult {
    #[serde(rename = "fileId")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub file_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub status: Option<String>,
}

impl DocumentUploadResult {
    pub fn builder() -> DocumentUploadResultBuilder {
        DocumentUploadResultBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct DocumentUploadResultBuilder {
    file_id: Option<String>,
    status: Option<String>,
}

impl DocumentUploadResultBuilder {
    pub fn file_id(mut self, value: impl Into<String>) -> Self {
        self.file_id = Some(value.into());
        self
    }

    pub fn status(mut self, value: impl Into<String>) -> Self {
        self.status = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`DocumentUploadResult`].
    pub fn build(self) -> Result<DocumentUploadResult, BuildError> {
        Ok(DocumentUploadResult {
            file_id: self.file_id,
            status: self.status,
        })
    }
}
