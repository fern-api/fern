pub use crate::prelude::*;

/// Tests that unknown types are able to preserve their type names.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct ObjectWithDocumentedUnknownType {
    #[serde(rename = "documentedUnknownType")]
    pub documented_unknown_type: DocumentedUnknownType,
}

impl ObjectWithDocumentedUnknownType {
    pub fn builder() -> ObjectWithDocumentedUnknownTypeBuilder {
        ObjectWithDocumentedUnknownTypeBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ObjectWithDocumentedUnknownTypeBuilder {
    documented_unknown_type: Option<DocumentedUnknownType>,
}

impl ObjectWithDocumentedUnknownTypeBuilder {
    pub fn documented_unknown_type(mut self, value: DocumentedUnknownType) -> Self {
        self.documented_unknown_type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ObjectWithDocumentedUnknownType`].
    /// This method will fail if any of the following fields are not set:
    /// - [`documented_unknown_type`](ObjectWithDocumentedUnknownTypeBuilder::documented_unknown_type)
    pub fn build(self) -> Result<ObjectWithDocumentedUnknownType, BuildError> {
        Ok(ObjectWithDocumentedUnknownType {
            documented_unknown_type: self
                .documented_unknown_type
                .ok_or_else(|| BuildError::missing_field("documented_unknown_type"))?,
        })
    }
}
