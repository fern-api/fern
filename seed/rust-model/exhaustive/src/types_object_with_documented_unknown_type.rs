pub use crate::prelude::*;

/// Tests that unknown types are able to preserve their type names.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct TypesObjectWithDocumentedUnknownType {
    #[serde(rename = "documentedUnknownType")]
    pub documented_unknown_type: TypesDocumentedUnknownType,
}

impl TypesObjectWithDocumentedUnknownType {
    pub fn builder() -> TypesObjectWithDocumentedUnknownTypeBuilder {
        <TypesObjectWithDocumentedUnknownTypeBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TypesObjectWithDocumentedUnknownTypeBuilder {
    documented_unknown_type: Option<TypesDocumentedUnknownType>,
}

impl TypesObjectWithDocumentedUnknownTypeBuilder {
    pub fn documented_unknown_type(mut self, value: TypesDocumentedUnknownType) -> Self {
        self.documented_unknown_type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`TypesObjectWithDocumentedUnknownType`].
    /// This method will fail if any of the following fields are not set:
    /// - [`documented_unknown_type`](TypesObjectWithDocumentedUnknownTypeBuilder::documented_unknown_type)
    pub fn build(self) -> Result<TypesObjectWithDocumentedUnknownType, BuildError> {
        Ok(TypesObjectWithDocumentedUnknownType {
            documented_unknown_type: self.documented_unknown_type.ok_or_else(|| BuildError::missing_field("documented_unknown_type"))?,
        })
    }
}
