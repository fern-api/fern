pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct NestedObjectWithOptionalField {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub string: Option<String>,
    #[serde(rename = "NestedObject")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nested_object: Option<ObjectWithOptionalField>,
}

impl NestedObjectWithOptionalField {
    pub fn builder() -> NestedObjectWithOptionalFieldBuilder {
        NestedObjectWithOptionalFieldBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct NestedObjectWithOptionalFieldBuilder {
    string: Option<String>,
    nested_object: Option<ObjectWithOptionalField>,
}

impl NestedObjectWithOptionalFieldBuilder {
    pub fn string(mut self, value: impl Into<String>) -> Self {
        self.string = Some(value.into());
        self
    }

    pub fn nested_object(mut self, value: ObjectWithOptionalField) -> Self {
        self.nested_object = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`NestedObjectWithOptionalField`].
    pub fn build(self) -> Result<NestedObjectWithOptionalField, BuildError> {
        Ok(NestedObjectWithOptionalField {
            string: self.string,
            nested_object: self.nested_object,
        })
    }
}
