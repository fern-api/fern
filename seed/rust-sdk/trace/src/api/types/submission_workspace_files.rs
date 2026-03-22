pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct WorkspaceFiles {
    #[serde(rename = "mainFile")]
    #[serde(default)]
    pub main_file: FileInfo,
    #[serde(rename = "readOnlyFiles")]
    #[serde(default)]
    pub read_only_files: Vec<FileInfo>,
}

impl WorkspaceFiles {
    pub fn builder() -> WorkspaceFilesBuilder {
        WorkspaceFilesBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct WorkspaceFilesBuilder {
    main_file: Option<FileInfo>,
    read_only_files: Option<Vec<FileInfo>>,
}

impl WorkspaceFilesBuilder {
    pub fn main_file(mut self, value: FileInfo) -> Self {
        self.main_file = Some(value);
        self
    }

    pub fn read_only_files(mut self, value: Vec<FileInfo>) -> Self {
        self.read_only_files = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`WorkspaceFiles`].
    /// This method will fail if any of the following fields are not set:
    /// - [`main_file`](WorkspaceFilesBuilder::main_file)
    /// - [`read_only_files`](WorkspaceFilesBuilder::read_only_files)
    pub fn build(self) -> Result<WorkspaceFiles, BuildError> {
        Ok(WorkspaceFiles {
            main_file: self
                .main_file
                .ok_or_else(|| BuildError::missing_field("main_file"))?,
            read_only_files: self
                .read_only_files
                .ok_or_else(|| BuildError::missing_field("read_only_files"))?,
        })
    }
}
