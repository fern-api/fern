pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct File {
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub contents: String,
}

impl File {
    pub fn builder() -> FileBuilder {
        FileBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct FileBuilder {
    name: Option<String>,
    contents: Option<String>,
}

impl FileBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn contents(mut self, value: impl Into<String>) -> Self {
        self.contents = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`File`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](FileBuilder::name)
    /// - [`contents`](FileBuilder::contents)
    pub fn build(self) -> Result<File, BuildError> {
        Ok(File {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            contents: self
                .contents
                .ok_or_else(|| BuildError::missing_field("contents"))?,
        })
    }
}
