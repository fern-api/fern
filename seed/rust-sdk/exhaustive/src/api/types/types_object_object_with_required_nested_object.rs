pub use crate::prelude::*;

/// Tests that dynamic snippets recursively construct default objects for
/// required properties whose type is a named object. The nested object's
/// own required properties should also be filled with defaults.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct ObjectWithRequiredNestedObject {
    #[serde(rename = "requiredString")]
    #[serde(default)]
    pub required_string: String,
    #[serde(rename = "requiredObject")]
    #[serde(default)]
    pub required_object: NestedObjectWithRequiredField,
}

impl ObjectWithRequiredNestedObject {
    pub fn builder() -> ObjectWithRequiredNestedObjectBuilder {
        <ObjectWithRequiredNestedObjectBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ObjectWithRequiredNestedObjectBuilder {
    required_string: Option<String>,
    required_object: Option<NestedObjectWithRequiredField>,
}

impl ObjectWithRequiredNestedObjectBuilder {
    pub fn required_string(mut self, value: impl Into<String>) -> Self {
        self.required_string = Some(value.into());
        self
    }

    pub fn required_object(mut self, value: NestedObjectWithRequiredField) -> Self {
        self.required_object = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ObjectWithRequiredNestedObject`].
    /// This method will fail if any of the following fields are not set:
    /// - [`required_string`](ObjectWithRequiredNestedObjectBuilder::required_string)
    /// - [`required_object`](ObjectWithRequiredNestedObjectBuilder::required_object)
    pub fn build(self) -> Result<ObjectWithRequiredNestedObject, BuildError> {
        Ok(ObjectWithRequiredNestedObject {
            required_string: self
                .required_string
                .ok_or_else(|| BuildError::missing_field("required_string"))?,
            required_object: self
                .required_object
                .ok_or_else(|| BuildError::missing_field("required_object"))?,
        })
    }
}
