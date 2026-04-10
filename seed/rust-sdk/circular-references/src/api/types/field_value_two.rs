pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct FieldValueTwo {
    pub r#type: FieldValueTwoType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<Box<ContainerValue>>,
}

impl FieldValueTwo {
    pub fn builder() -> FieldValueTwoBuilder {
        <FieldValueTwoBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct FieldValueTwoBuilder {
    r#type: Option<FieldValueTwoType>,
    value: Option<Box<ContainerValue>>,
}

impl FieldValueTwoBuilder {
    pub fn r#type(mut self, value: FieldValueTwoType) -> Self {
        self.r#type = Some(value);
        self
    }

    pub fn value(mut self, value: Box<ContainerValue>) -> Self {
        self.value = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`FieldValueTwo`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](FieldValueTwoBuilder::r#type)
    pub fn build(self) -> Result<FieldValueTwo, BuildError> {
        Ok(FieldValueTwo {
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
            value: self.value,
        })
    }
}
