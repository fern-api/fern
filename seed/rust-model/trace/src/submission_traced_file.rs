pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct TracedFile {
    #[serde(default)]
    pub filename: String,
    #[serde(default)]
    pub directory: String,
}

impl TracedFile {
    pub fn builder() -> TracedFileBuilder {
        <TracedFileBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TracedFileBuilder {
    filename: Option<String>,
    directory: Option<String>,
}

impl TracedFileBuilder {
    pub fn filename(mut self, value: impl Into<String>) -> Self {
        self.filename = Some(value.into());
        self
    }

    pub fn directory(mut self, value: impl Into<String>) -> Self {
        self.directory = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`TracedFile`].
    /// This method will fail if any of the following fields are not set:
    /// - [`filename`](TracedFileBuilder::filename)
    /// - [`directory`](TracedFileBuilder::directory)
    pub fn build(self) -> Result<TracedFile, BuildError> {
        Ok(TracedFile {
            filename: self.filename.ok_or_else(|| BuildError::missing_field("filename"))?,
            directory: self.directory.ok_or_else(|| BuildError::missing_field("directory"))?,
        })
    }
}
