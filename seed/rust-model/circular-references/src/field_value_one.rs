pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct FieldValueOne {
    #[serde(flatten)]
    pub object_value_fields: ObjectValue,
    pub r#type: FieldValueOneType,
}

impl FieldValueOne {
    pub fn builder() -> FieldValueOneBuilder {
        <FieldValueOneBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct FieldValueOneBuilder {
    object_value_fields: Option<ObjectValue>,
    r#type: Option<FieldValueOneType>,
}

impl FieldValueOneBuilder {
    pub fn object_value_fields(mut self, value: ObjectValue) -> Self {
        self.object_value_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: FieldValueOneType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`FieldValueOne`].
    /// This method will fail if any of the following fields are not set:
    /// - [`object_value_fields`](FieldValueOneBuilder::object_value_fields)
    /// - [`r#type`](FieldValueOneBuilder::r#type)
    pub fn build(self) -> Result<FieldValueOne, BuildError> {
        Ok(FieldValueOne {
            object_value_fields: self.object_value_fields.ok_or_else(|| BuildError::missing_field("object_value_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
