pub use crate::prelude::*;

/// Tests that a struct with a required field whose type extends a non-Default
/// base type does NOT incorrectly derive Default in Rust. Reproduces the bug
/// where namedTypeSupportsDefault only checked properties but not extends.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ObjectWithRequiredExtendedField {
    #[serde(rename = "requiredExtended")]
    #[serde(default)]
    pub required_extended: ExtendedObjectWithInheritedEnum,
}

impl ObjectWithRequiredExtendedField {
    pub fn builder() -> ObjectWithRequiredExtendedFieldBuilder {
        <ObjectWithRequiredExtendedFieldBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ObjectWithRequiredExtendedFieldBuilder {
    required_extended: Option<ExtendedObjectWithInheritedEnum>,
}

impl ObjectWithRequiredExtendedFieldBuilder {
    pub fn required_extended(mut self, value: ExtendedObjectWithInheritedEnum) -> Self {
        self.required_extended = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ObjectWithRequiredExtendedField`].
    /// This method will fail if any of the following fields are not set:
    /// - [`required_extended`](ObjectWithRequiredExtendedFieldBuilder::required_extended)
    pub fn build(self) -> Result<ObjectWithRequiredExtendedField, BuildError> {
        Ok(ObjectWithRequiredExtendedField {
            required_extended: self
                .required_extended
                .ok_or_else(|| BuildError::missing_field("required_extended"))?,
        })
    }
}
