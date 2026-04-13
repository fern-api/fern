pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct FileDirectory {
    #[serde(default)]
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub files: Option<Vec<File>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub directories: Option<Vec<Box<FileDirectory>>>,
}

impl FileDirectory {
    pub fn builder() -> FileDirectoryBuilder {
        <FileDirectoryBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct FileDirectoryBuilder {
    name: Option<String>,
    files: Option<Vec<File>>,
    directories: Option<Vec<Box<FileDirectory>>>,
}

impl FileDirectoryBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn files(mut self, value: Vec<File>) -> Self {
        self.files = Some(value);
        self
    }

    pub fn directories(mut self, value: Vec<Box<FileDirectory>>) -> Self {
        self.directories = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`FileDirectory`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](FileDirectoryBuilder::name)
    pub fn build(self) -> Result<FileDirectory, BuildError> {
        Ok(FileDirectory {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            files: self.files,
            directories: self.directories,
        })
    }
}
