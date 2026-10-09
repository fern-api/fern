pub use crate::prelude::*;

/// Extends ObjectWithInheritedRequiredEnum, inheriting the required enum field.
/// This type should NOT derive Default in Rust because the parent type
/// has a required enum field.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ExtendedObjectWithInheritedEnum {
    #[serde(flatten)]
    pub object_with_inherited_required_enum_fields: ObjectWithInheritedRequiredEnum,
    #[serde(rename = "optionalDescription")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_description: Option<String>,
}

impl ExtendedObjectWithInheritedEnum {
    pub fn builder() -> ExtendedObjectWithInheritedEnumBuilder {
        <ExtendedObjectWithInheritedEnumBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ExtendedObjectWithInheritedEnumBuilder {
    object_with_inherited_required_enum_fields: Option<ObjectWithInheritedRequiredEnum>,
    optional_description: Option<String>,
}

impl ExtendedObjectWithInheritedEnumBuilder {
    pub fn object_with_inherited_required_enum_fields(
        mut self,
        value: ObjectWithInheritedRequiredEnum,
    ) -> Self {
        self.object_with_inherited_required_enum_fields = Some(value);
        self
    }

    pub fn optional_description(mut self, value: impl Into<String>) -> Self {
        self.optional_description = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`ExtendedObjectWithInheritedEnum`].
    /// This method will fail if any of the following fields are not set:
    /// - [`object_with_inherited_required_enum_fields`](ExtendedObjectWithInheritedEnumBuilder::object_with_inherited_required_enum_fields)
    pub fn build(self) -> Result<ExtendedObjectWithInheritedEnum, BuildError> {
        Ok(ExtendedObjectWithInheritedEnum {
            object_with_inherited_required_enum_fields: self
                .object_with_inherited_required_enum_fields
                .ok_or_else(|| {
                    BuildError::missing_field("object_with_inherited_required_enum_fields")
                })?,
            optional_description: self.optional_description,
        })
    }
}
