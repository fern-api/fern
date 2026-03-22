pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Files {
    #[serde(default)]
    pub files: Vec<FileInfoV2>,
}

impl Files {
    pub fn builder() -> FilesBuilder {
        FilesBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct FilesBuilder {
    files: Option<Vec<FileInfoV2>>,
}

impl FilesBuilder {
    pub fn files(mut self, value: Vec<FileInfoV2>) -> Self {
        self.files = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Files`].
    /// This method will fail if any of the following fields are not set:
    /// - [`files`](FilesBuilder::files)
    pub fn build(self) -> Result<Files, BuildError> {
        Ok(Files {
            files: self
                .files
                .ok_or_else(|| BuildError::missing_field("files"))?,
        })
    }
}
