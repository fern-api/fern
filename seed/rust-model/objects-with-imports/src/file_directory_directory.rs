pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct Directory {
    #[serde(default)]
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub files: Option<Vec<File>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub directories: Option<Vec<Box<Directory>>>,
}

impl Directory {
    pub fn builder() -> DirectoryBuilder {
        <DirectoryBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct DirectoryBuilder {
    name: Option<String>,
    files: Option<Vec<File>>,
    directories: Option<Vec<Box<Directory>>>,
}

impl DirectoryBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn files(mut self, value: Vec<File>) -> Self {
        self.files = Some(value);
        self
    }

    pub fn directories(mut self, value: Vec<Box<Directory>>) -> Self {
        self.directories = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Directory`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](DirectoryBuilder::name)
    pub fn build(self) -> Result<Directory, BuildError> {
        Ok(Directory {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            files: self.files,
            directories: self.directories,
        })
    }
}
