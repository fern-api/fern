pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ImportingType {
    #[serde(default)]
    pub imported: Imported,
}

impl ImportingType {
    pub fn builder() -> ImportingTypeBuilder {
        ImportingTypeBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ImportingTypeBuilder {
    imported: Option<Imported>,
}

impl ImportingTypeBuilder {
    pub fn imported(mut self, value: Imported) -> Self {
        self.imported = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ImportingType`].
    /// This method will fail if any of the following fields are not set:
    /// - [`imported`](ImportingTypeBuilder::imported)
    pub fn build(self) -> Result<ImportingType, BuildError> {
        Ok(ImportingType {
            imported: self.imported.ok_or_else(|| BuildError::missing_field("imported"))?,
        })
    }
}
