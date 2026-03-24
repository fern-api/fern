pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct SubmissionFileInfo {
    #[serde(default)]
    pub directory: String,
    #[serde(default)]
    pub filename: String,
    #[serde(default)]
    pub contents: String,
}

impl SubmissionFileInfo {
    pub fn builder() -> SubmissionFileInfoBuilder {
        SubmissionFileInfoBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SubmissionFileInfoBuilder {
    directory: Option<String>,
    filename: Option<String>,
    contents: Option<String>,
}

impl SubmissionFileInfoBuilder {
    pub fn directory(mut self, value: impl Into<String>) -> Self {
        self.directory = Some(value.into());
        self
    }

    pub fn filename(mut self, value: impl Into<String>) -> Self {
        self.filename = Some(value.into());
        self
    }

    pub fn contents(mut self, value: impl Into<String>) -> Self {
        self.contents = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`SubmissionFileInfo`].
    /// This method will fail if any of the following fields are not set:
    /// - [`directory`](SubmissionFileInfoBuilder::directory)
    /// - [`filename`](SubmissionFileInfoBuilder::filename)
    /// - [`contents`](SubmissionFileInfoBuilder::contents)
    pub fn build(self) -> Result<SubmissionFileInfo, BuildError> {
        Ok(SubmissionFileInfo {
            directory: self
                .directory
                .ok_or_else(|| BuildError::missing_field("directory"))?,
            filename: self
                .filename
                .ok_or_else(|| BuildError::missing_field("filename"))?,
            contents: self
                .contents
                .ok_or_else(|| BuildError::missing_field("contents"))?,
        })
    }
}
