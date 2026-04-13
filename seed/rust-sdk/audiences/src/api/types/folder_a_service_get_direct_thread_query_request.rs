pub use crate::prelude::*;

/// Query parameters for folderA_service_getDirectThread
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct FolderAServiceGetDirectThreadQueryRequest {
    #[serde(default)]
    pub ids: Vec<Option<String>>,
    #[serde(default)]
    pub tags: Vec<Option<String>>,
}

impl FolderAServiceGetDirectThreadQueryRequest {
    pub fn builder() -> FolderAServiceGetDirectThreadQueryRequestBuilder {
        <FolderAServiceGetDirectThreadQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct FolderAServiceGetDirectThreadQueryRequestBuilder {
    ids: Option<Vec<Option<String>>>,
    tags: Option<Vec<Option<String>>>,
}

impl FolderAServiceGetDirectThreadQueryRequestBuilder {
    pub fn ids(mut self, value: Vec<Option<String>>) -> Self {
        self.ids = Some(value);
        self
    }

    pub fn tags(mut self, value: Vec<Option<String>>) -> Self {
        self.tags = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`FolderAServiceGetDirectThreadQueryRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`ids`](FolderAServiceGetDirectThreadQueryRequestBuilder::ids)
    /// - [`tags`](FolderAServiceGetDirectThreadQueryRequestBuilder::tags)
    pub fn build(self) -> Result<FolderAServiceGetDirectThreadQueryRequest, BuildError> {
        Ok(FolderAServiceGetDirectThreadQueryRequest {
            ids: self.ids.ok_or_else(|| BuildError::missing_field("ids"))?,
            tags: self.tags.ok_or_else(|| BuildError::missing_field("tags"))?,
        })
    }
}
