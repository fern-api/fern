pub use crate::prelude::*;

/// This type allows us to test a circular reference with a union type (see FieldValue).
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ObjectFieldValue {
    #[serde(default)]
    pub name: FieldName,
    pub value: FieldValue,
}

impl ObjectFieldValue {
    pub fn builder() -> ObjectFieldValueBuilder {
        ObjectFieldValueBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ObjectFieldValueBuilder {
    name: Option<FieldName>,
    value: Option<FieldValue>,
}

impl ObjectFieldValueBuilder {
    pub fn name(mut self, value: FieldName) -> Self {
        self.name = Some(value);
        self
    }

    pub fn value(mut self, value: FieldValue) -> Self {
        self.value = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ObjectFieldValue`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](ObjectFieldValueBuilder::name)
    /// - [`value`](ObjectFieldValueBuilder::value)
    pub fn build(self) -> Result<ObjectFieldValue, BuildError> {
        Ok(ObjectFieldValue {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            value: self.value.ok_or_else(|| BuildError::missing_field("value"))?,
        })
    }
}
