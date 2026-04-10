pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct VariableValueSix {
    pub r#type: VariableValueSixType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<Vec<Box<VariableValue>>>,
}

impl VariableValueSix {
    pub fn builder() -> VariableValueSixBuilder {
        <VariableValueSixBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct VariableValueSixBuilder {
    r#type: Option<VariableValueSixType>,
    value: Option<Vec<Box<VariableValue>>>,
}

impl VariableValueSixBuilder {
    pub fn r#type(mut self, value: VariableValueSixType) -> Self {
        self.r#type = Some(value);
        self
    }

    pub fn value(mut self, value: Vec<Box<VariableValue>>) -> Self {
        self.value = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`VariableValueSix`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](VariableValueSixBuilder::r#type)
    pub fn build(self) -> Result<VariableValueSix, BuildError> {
        Ok(VariableValueSix {
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
            value: self.value,
        })
    }
}
