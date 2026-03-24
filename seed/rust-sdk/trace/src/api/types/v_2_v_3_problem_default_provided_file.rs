pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct DefaultProvidedFile2 {
    #[serde(default)]
    pub file: FileInfoV22,
    #[serde(rename = "relatedTypes")]
    #[serde(default)]
    pub related_types: Vec<VariableType>,
}

impl DefaultProvidedFile2 {
    pub fn builder() -> DefaultProvidedFile2Builder {
        DefaultProvidedFile2Builder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct DefaultProvidedFile2Builder {
    file: Option<FileInfoV22>,
    related_types: Option<Vec<VariableType>>,
}

impl DefaultProvidedFile2Builder {
    pub fn file(mut self, value: FileInfoV22) -> Self {
        self.file = Some(value);
        self
    }

    pub fn related_types(mut self, value: Vec<VariableType>) -> Self {
        self.related_types = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`DefaultProvidedFile2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`file`](DefaultProvidedFile2Builder::file)
    /// - [`related_types`](DefaultProvidedFile2Builder::related_types)
    pub fn build(self) -> Result<DefaultProvidedFile2, BuildError> {
        Ok(DefaultProvidedFile2 {
            file: self.file.ok_or_else(|| BuildError::missing_field("file"))?,
            related_types: self
                .related_types
                .ok_or_else(|| BuildError::missing_field("related_types"))?,
        })
    }
}
