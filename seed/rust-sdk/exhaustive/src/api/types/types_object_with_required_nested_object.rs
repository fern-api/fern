pub use crate::prelude::*;

/// Tests that dynamic snippets recursively construct default objects for
/// required properties whose type is a named object. The nested object's
/// own required properties should also be filled with defaults.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct TypesObjectWithRequiredNestedObject {
    #[serde(rename = "requiredString")]
    #[serde(default)]
    pub required_string: String,
    #[serde(rename = "requiredObject")]
    #[serde(default)]
    pub required_object: TypesNestedObjectWithRequiredField,
}

impl TypesObjectWithRequiredNestedObject {
    pub fn builder() -> TypesObjectWithRequiredNestedObjectBuilder {
        <TypesObjectWithRequiredNestedObjectBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TypesObjectWithRequiredNestedObjectBuilder {
    required_string: Option<String>,
    required_object: Option<TypesNestedObjectWithRequiredField>,
}

impl TypesObjectWithRequiredNestedObjectBuilder {
    pub fn required_string(mut self, value: impl Into<String>) -> Self {
        self.required_string = Some(value.into());
        self
    }

    pub fn required_object(mut self, value: TypesNestedObjectWithRequiredField) -> Self {
        self.required_object = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`TypesObjectWithRequiredNestedObject`].
    /// This method will fail if any of the following fields are not set:
    /// - [`required_string`](TypesObjectWithRequiredNestedObjectBuilder::required_string)
    /// - [`required_object`](TypesObjectWithRequiredNestedObjectBuilder::required_object)
    pub fn build(self) -> Result<TypesObjectWithRequiredNestedObject, BuildError> {
        Ok(TypesObjectWithRequiredNestedObject {
            required_string: self
                .required_string
                .ok_or_else(|| BuildError::missing_field("required_string"))?,
            required_object: self
                .required_object
                .ok_or_else(|| BuildError::missing_field("required_object"))?,
        })
    }
}
