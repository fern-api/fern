pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct V2DefaultProvidedFile {
    #[serde(default)]
    pub file: V2FileInfoV2,
    #[serde(rename = "relatedTypes")]
    #[serde(default)]
    pub related_types: Vec<VariableType>,
}

impl V2DefaultProvidedFile {
    pub fn builder() -> V2DefaultProvidedFileBuilder {
        <V2DefaultProvidedFileBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2DefaultProvidedFileBuilder {
    file: Option<V2FileInfoV2>,
    related_types: Option<Vec<VariableType>>,
}

impl V2DefaultProvidedFileBuilder {
    pub fn file(mut self, value: V2FileInfoV2) -> Self {
        self.file = Some(value);
        self
    }

    pub fn related_types(mut self, value: Vec<VariableType>) -> Self {
        self.related_types = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2DefaultProvidedFile`].
    /// This method will fail if any of the following fields are not set:
    /// - [`file`](V2DefaultProvidedFileBuilder::file)
    /// - [`related_types`](V2DefaultProvidedFileBuilder::related_types)
    pub fn build(self) -> Result<V2DefaultProvidedFile, BuildError> {
        Ok(V2DefaultProvidedFile {
            file: self.file.ok_or_else(|| BuildError::missing_field("file"))?,
            related_types: self
                .related_types
                .ok_or_else(|| BuildError::missing_field("related_types"))?,
        })
    }
}
