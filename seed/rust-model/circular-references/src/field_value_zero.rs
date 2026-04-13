pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct FieldValueZero {
    pub r#type: FieldValueZeroType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<PrimitiveValue>,
}

impl FieldValueZero {
    pub fn builder() -> FieldValueZeroBuilder {
        <FieldValueZeroBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct FieldValueZeroBuilder {
    r#type: Option<FieldValueZeroType>,
    value: Option<PrimitiveValue>,
}

impl FieldValueZeroBuilder {
    pub fn r#type(mut self, value: FieldValueZeroType) -> Self {
        self.r#type = Some(value);
        self
    }

    pub fn value(mut self, value: PrimitiveValue) -> Self {
        self.value = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`FieldValueZero`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](FieldValueZeroBuilder::r#type)
    pub fn build(self) -> Result<FieldValueZero, BuildError> {
        Ok(FieldValueZero {
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
            value: self.value,
        })
    }
}
