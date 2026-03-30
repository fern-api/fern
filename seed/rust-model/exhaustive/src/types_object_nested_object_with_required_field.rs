pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct NestedObjectWithRequiredField {
    #[serde(default)]
    pub string: String,
    #[serde(rename = "NestedObject")]
    #[serde(default)]
    pub nested_object: ObjectWithOptionalField,
}

impl NestedObjectWithRequiredField {
    pub fn builder() -> NestedObjectWithRequiredFieldBuilder {
        <NestedObjectWithRequiredFieldBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct NestedObjectWithRequiredFieldBuilder {
    string: Option<String>,
    nested_object: Option<ObjectWithOptionalField>,
}

impl NestedObjectWithRequiredFieldBuilder {
    pub fn string(mut self, value: impl Into<String>) -> Self {
        self.string = Some(value.into());
        self
    }

    pub fn nested_object(mut self, value: ObjectWithOptionalField) -> Self {
        self.nested_object = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`NestedObjectWithRequiredField`].
    /// This method will fail if any of the following fields are not set:
    /// - [`string`](NestedObjectWithRequiredFieldBuilder::string)
    /// - [`nested_object`](NestedObjectWithRequiredFieldBuilder::nested_object)
    pub fn build(self) -> Result<NestedObjectWithRequiredField, BuildError> {
        Ok(NestedObjectWithRequiredField {
            string: self.string.ok_or_else(|| BuildError::missing_field("string"))?,
            nested_object: self.nested_object.ok_or_else(|| BuildError::missing_field("nested_object"))?,
        })
    }
}
