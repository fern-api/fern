pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct V2V3FileInfoV2 {
    #[serde(default)]
    pub filename: String,
    #[serde(default)]
    pub directory: String,
    #[serde(default)]
    pub contents: String,
    #[serde(default)]
    pub editable: bool,
}

impl V2V3FileInfoV2 {
    pub fn builder() -> V2V3FileInfoV2Builder {
        <V2V3FileInfoV2Builder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2V3FileInfoV2Builder {
    filename: Option<String>,
    directory: Option<String>,
    contents: Option<String>,
    editable: Option<bool>,
}

impl V2V3FileInfoV2Builder {
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

    /// Consumes the builder and constructs a [`V2V3FileInfoV2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`filename`](V2V3FileInfoV2Builder::filename)
    /// - [`directory`](V2V3FileInfoV2Builder::directory)
    /// - [`contents`](V2V3FileInfoV2Builder::contents)
    /// - [`editable`](V2V3FileInfoV2Builder::editable)
    pub fn build(self) -> Result<V2V3FileInfoV2, BuildError> {
        Ok(V2V3FileInfoV2 {
            filename: self.filename.ok_or_else(|| BuildError::missing_field("filename"))?,
            directory: self.directory.ok_or_else(|| BuildError::missing_field("directory"))?,
            contents: self.contents.ok_or_else(|| BuildError::missing_field("contents"))?,
            editable: self.editable.ok_or_else(|| BuildError::missing_field("editable"))?,
        })
    }
}
