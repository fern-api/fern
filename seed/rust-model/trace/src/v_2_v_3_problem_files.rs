pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Files2 {
    #[serde(default)]
    pub files: Vec<FileInfoV22>,
}

impl Files2 {
    pub fn builder() -> Files2Builder {
        <Files2Builder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct Files2Builder {
    files: Option<Vec<FileInfoV22>>,
}

impl Files2Builder {
    pub fn files(mut self, value: Vec<FileInfoV22>) -> Self {
        self.files = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Files2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`files`](Files2Builder::files)
    pub fn build(self) -> Result<Files2, BuildError> {
        Ok(Files2 {
            files: self.files.ok_or_else(|| BuildError::missing_field("files"))?,
        })
    }
}
