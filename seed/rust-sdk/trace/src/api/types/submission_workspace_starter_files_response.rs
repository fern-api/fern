pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct WorkspaceStarterFilesResponse {
    #[serde(default)]
    pub files: HashMap<Language, WorkspaceFiles>,
}

impl WorkspaceStarterFilesResponse {
    pub fn builder() -> WorkspaceStarterFilesResponseBuilder {
        WorkspaceStarterFilesResponseBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct WorkspaceStarterFilesResponseBuilder {
    files: Option<HashMap<Language, WorkspaceFiles>>,
}

impl WorkspaceStarterFilesResponseBuilder {
    pub fn files(mut self, value: HashMap<Language, WorkspaceFiles>) -> Self {
        self.files = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`WorkspaceStarterFilesResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`files`](WorkspaceStarterFilesResponseBuilder::files)
    pub fn build(self) -> Result<WorkspaceStarterFilesResponse, BuildError> {
        Ok(WorkspaceStarterFilesResponse {
            files: self
                .files
                .ok_or_else(|| BuildError::missing_field("files"))?,
        })
    }
}
