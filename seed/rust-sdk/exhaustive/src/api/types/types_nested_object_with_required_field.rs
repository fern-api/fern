pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct TypesNestedObjectWithRequiredField {
    #[serde(default)]
    pub string: String,
    #[serde(rename = "NestedObject")]
    #[serde(default)]
    pub nested_object: TypesObjectWithOptionalField,
}

impl TypesNestedObjectWithRequiredField {
    pub fn builder() -> TypesNestedObjectWithRequiredFieldBuilder {
        <TypesNestedObjectWithRequiredFieldBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TypesNestedObjectWithRequiredFieldBuilder {
    string: Option<String>,
    nested_object: Option<TypesObjectWithOptionalField>,
}

impl TypesNestedObjectWithRequiredFieldBuilder {
    pub fn string(mut self, value: impl Into<String>) -> Self {
        self.string = Some(value.into());
        self
    }

    pub fn nested_object(mut self, value: TypesObjectWithOptionalField) -> Self {
        self.nested_object = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`TypesNestedObjectWithRequiredField`].
    /// This method will fail if any of the following fields are not set:
    /// - [`string`](TypesNestedObjectWithRequiredFieldBuilder::string)
    /// - [`nested_object`](TypesNestedObjectWithRequiredFieldBuilder::nested_object)
    pub fn build(self) -> Result<TypesNestedObjectWithRequiredField, BuildError> {
        Ok(TypesNestedObjectWithRequiredField {
            string: self
                .string
                .ok_or_else(|| BuildError::missing_field("string"))?,
            nested_object: self
                .nested_object
                .ok_or_else(|| BuildError::missing_field("nested_object"))?,
        })
    }
}
