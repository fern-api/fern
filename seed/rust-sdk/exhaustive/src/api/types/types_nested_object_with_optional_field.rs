pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct TypesNestedObjectWithOptionalField {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub string: Option<String>,
    #[serde(rename = "NestedObject")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nested_object: Option<TypesObjectWithOptionalField>,
}

impl TypesNestedObjectWithOptionalField {
    pub fn builder() -> TypesNestedObjectWithOptionalFieldBuilder {
        <TypesNestedObjectWithOptionalFieldBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TypesNestedObjectWithOptionalFieldBuilder {
    string: Option<String>,
    nested_object: Option<TypesObjectWithOptionalField>,
}

impl TypesNestedObjectWithOptionalFieldBuilder {
    pub fn string(mut self, value: impl Into<String>) -> Self {
        self.string = Some(value.into());
        self
    }

    pub fn nested_object(mut self, value: TypesObjectWithOptionalField) -> Self {
        self.nested_object = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`TypesNestedObjectWithOptionalField`].
    pub fn build(self) -> Result<TypesNestedObjectWithOptionalField, BuildError> {
        Ok(TypesNestedObjectWithOptionalField {
            string: self.string,
            nested_object: self.nested_object,
        })
    }
}
