pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct V2V3DefaultProvidedFile {
    #[serde(default)]
    pub file: V2V3FileInfoV2,
    #[serde(rename = "relatedTypes")]
    #[serde(default)]
    pub related_types: Vec<VariableType>,
}

impl V2V3DefaultProvidedFile {
    pub fn builder() -> V2V3DefaultProvidedFileBuilder {
        <V2V3DefaultProvidedFileBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2V3DefaultProvidedFileBuilder {
    file: Option<V2V3FileInfoV2>,
    related_types: Option<Vec<VariableType>>,
}

impl V2V3DefaultProvidedFileBuilder {
    pub fn file(mut self, value: V2V3FileInfoV2) -> Self {
        self.file = Some(value);
        self
    }

    pub fn related_types(mut self, value: Vec<VariableType>) -> Self {
        self.related_types = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2V3DefaultProvidedFile`].
    /// This method will fail if any of the following fields are not set:
    /// - [`file`](V2V3DefaultProvidedFileBuilder::file)
    /// - [`related_types`](V2V3DefaultProvidedFileBuilder::related_types)
    pub fn build(self) -> Result<V2V3DefaultProvidedFile, BuildError> {
        Ok(V2V3DefaultProvidedFile {
            file: self.file.ok_or_else(|| BuildError::missing_field("file"))?,
            related_types: self.related_types.ok_or_else(|| BuildError::missing_field("related_types"))?,
        })
    }
}
