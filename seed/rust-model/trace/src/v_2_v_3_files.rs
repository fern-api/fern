pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct V2V3Files {
    #[serde(default)]
    pub files: Vec<V2V3FileInfoV2>,
}

impl V2V3Files {
    pub fn builder() -> V2V3FilesBuilder {
        <V2V3FilesBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2V3FilesBuilder {
    files: Option<Vec<V2V3FileInfoV2>>,
}

impl V2V3FilesBuilder {
    pub fn files(mut self, value: Vec<V2V3FileInfoV2>) -> Self {
        self.files = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2V3Files`].
    /// This method will fail if any of the following fields are not set:
    /// - [`files`](V2V3FilesBuilder::files)
    pub fn build(self) -> Result<V2V3Files, BuildError> {
        Ok(V2V3Files {
            files: self.files.ok_or_else(|| BuildError::missing_field("files"))?,
        })
    }
}
