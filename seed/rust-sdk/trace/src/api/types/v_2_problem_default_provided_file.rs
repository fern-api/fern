pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct DefaultProvidedFile {
    #[serde(default)]
    pub file: FileInfoV2,
    #[serde(rename = "relatedTypes")]
    #[serde(default)]
    pub related_types: Vec<VariableType>,
}

impl DefaultProvidedFile {
    pub fn builder() -> DefaultProvidedFileBuilder {
        <DefaultProvidedFileBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct DefaultProvidedFileBuilder {
    file: Option<FileInfoV2>,
    related_types: Option<Vec<VariableType>>,
}

impl DefaultProvidedFileBuilder {
    pub fn file(mut self, value: FileInfoV2) -> Self {
        self.file = Some(value);
        self
    }

    pub fn related_types(mut self, value: Vec<VariableType>) -> Self {
        self.related_types = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`DefaultProvidedFile`].
    /// This method will fail if any of the following fields are not set:
    /// - [`file`](DefaultProvidedFileBuilder::file)
    /// - [`related_types`](DefaultProvidedFileBuilder::related_types)
    pub fn build(self) -> Result<DefaultProvidedFile, BuildError> {
        Ok(DefaultProvidedFile {
            file: self.file.ok_or_else(|| BuildError::missing_field("file"))?,
            related_types: self
                .related_types
                .ok_or_else(|| BuildError::missing_field("related_types"))?,
        })
    }
}
