pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct FilesUploadRequest {
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub parent_id: String,
}

impl FilesUploadRequest {
    pub fn builder() -> FilesUploadRequestBuilder {
        <FilesUploadRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct FilesUploadRequestBuilder {
    name: Option<String>,
    parent_id: Option<String>,
}

impl FilesUploadRequestBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn parent_id(mut self, value: impl Into<String>) -> Self {
        self.parent_id = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`FilesUploadRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](FilesUploadRequestBuilder::name)
    /// - [`parent_id`](FilesUploadRequestBuilder::parent_id)
    pub fn build(self) -> Result<FilesUploadRequest, BuildError> {
        Ok(FilesUploadRequest {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            parent_id: self
                .parent_id
                .ok_or_else(|| BuildError::missing_field("parent_id"))?,
        })
    }
}
