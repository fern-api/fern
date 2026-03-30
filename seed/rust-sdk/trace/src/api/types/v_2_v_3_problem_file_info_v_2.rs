pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct FileInfoV22 {
    #[serde(default)]
    pub filename: String,
    #[serde(default)]
    pub directory: String,
    #[serde(default)]
    pub contents: String,
    #[serde(default)]
    pub editable: bool,
}

impl FileInfoV22 {
    pub fn builder() -> FileInfoV22Builder {
        <FileInfoV22Builder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct FileInfoV22Builder {
    filename: Option<String>,
    directory: Option<String>,
    contents: Option<String>,
    editable: Option<bool>,
}

impl FileInfoV22Builder {
    pub fn filename(mut self, value: impl Into<String>) -> Self {
        self.filename = Some(value.into());
        self
    }

    pub fn directory(mut self, value: impl Into<String>) -> Self {
        self.directory = Some(value.into());
        self
    }

    pub fn contents(mut self, value: impl Into<String>) -> Self {
        self.contents = Some(value.into());
        self
    }

    pub fn editable(mut self, value: bool) -> Self {
        self.editable = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`FileInfoV22`].
    /// This method will fail if any of the following fields are not set:
    /// - [`filename`](FileInfoV22Builder::filename)
    /// - [`directory`](FileInfoV22Builder::directory)
    /// - [`contents`](FileInfoV22Builder::contents)
    /// - [`editable`](FileInfoV22Builder::editable)
    pub fn build(self) -> Result<FileInfoV22, BuildError> {
        Ok(FileInfoV22 {
            filename: self
                .filename
                .ok_or_else(|| BuildError::missing_field("filename"))?,
            directory: self
                .directory
                .ok_or_else(|| BuildError::missing_field("directory"))?,
            contents: self
                .contents
                .ok_or_else(|| BuildError::missing_field("contents"))?,
            editable: self
                .editable
                .ok_or_else(|| BuildError::missing_field("editable"))?,
        })
    }
}
