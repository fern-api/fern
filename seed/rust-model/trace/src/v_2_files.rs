pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct V2Files {
    #[serde(default)]
    pub files: Vec<V2FileInfoV2>,
}

impl V2Files {
    pub fn builder() -> V2FilesBuilder {
        <V2FilesBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2FilesBuilder {
    files: Option<Vec<V2FileInfoV2>>,
}

impl V2FilesBuilder {
    pub fn files(mut self, value: Vec<V2FileInfoV2>) -> Self {
        self.files = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2Files`].
    /// This method will fail if any of the following fields are not set:
    /// - [`files`](V2FilesBuilder::files)
    pub fn build(self) -> Result<V2Files, BuildError> {
        Ok(V2Files {
            files: self.files.ok_or_else(|| BuildError::missing_field("files"))?,
        })
    }
}
