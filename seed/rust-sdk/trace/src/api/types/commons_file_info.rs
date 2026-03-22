pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct FileInfo {
    #[serde(default)]
    pub filename: String,
    #[serde(default)]
    pub contents: String,
}

impl FileInfo {
    pub fn builder() -> FileInfoBuilder {
        FileInfoBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct FileInfoBuilder {
    filename: Option<String>,
    contents: Option<String>,
}

impl FileInfoBuilder {
    pub fn filename(mut self, value: impl Into<String>) -> Self {
        self.filename = Some(value.into());
        self
    }

    pub fn contents(mut self, value: impl Into<String>) -> Self {
        self.contents = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`FileInfo`].
    /// This method will fail if any of the following fields are not set:
    /// - [`filename`](FileInfoBuilder::filename)
    /// - [`contents`](FileInfoBuilder::contents)
    pub fn build(self) -> Result<FileInfo, BuildError> {
        Ok(FileInfo {
            filename: self
                .filename
                .ok_or_else(|| BuildError::missing_field("filename"))?,
            contents: self
                .contents
                .ok_or_else(|| BuildError::missing_field("contents"))?,
        })
    }
}
