pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct WorkspaceStarterFilesResponseV2 {
    #[serde(rename = "filesByLanguage")]
    #[serde(default)]
    pub files_by_language: HashMap<Language, Files>,
}

impl WorkspaceStarterFilesResponseV2 {
    pub fn builder() -> WorkspaceStarterFilesResponseV2Builder {
        <WorkspaceStarterFilesResponseV2Builder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct WorkspaceStarterFilesResponseV2Builder {
    files_by_language: Option<HashMap<Language, Files>>,
}

impl WorkspaceStarterFilesResponseV2Builder {
    pub fn files_by_language(mut self, value: HashMap<Language, Files>) -> Self {
        self.files_by_language = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`WorkspaceStarterFilesResponseV2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`files_by_language`](WorkspaceStarterFilesResponseV2Builder::files_by_language)
    pub fn build(self) -> Result<WorkspaceStarterFilesResponseV2, BuildError> {
        Ok(WorkspaceStarterFilesResponseV2 {
            files_by_language: self
                .files_by_language
                .ok_or_else(|| BuildError::missing_field("files_by_language"))?,
        })
    }
}
