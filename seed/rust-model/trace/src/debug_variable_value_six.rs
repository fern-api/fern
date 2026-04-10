pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct DebugVariableValueSix {
    pub r#type: DebugVariableValueSixType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<Vec<Box<DebugVariableValue>>>,
}

impl DebugVariableValueSix {
    pub fn builder() -> DebugVariableValueSixBuilder {
        <DebugVariableValueSixBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct DebugVariableValueSixBuilder {
    r#type: Option<DebugVariableValueSixType>,
    value: Option<Vec<Box<DebugVariableValue>>>,
}

impl DebugVariableValueSixBuilder {
    pub fn r#type(mut self, value: DebugVariableValueSixType) -> Self {
        self.r#type = Some(value);
        self
    }

    pub fn value(mut self, value: Vec<Box<DebugVariableValue>>) -> Self {
        self.value = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`DebugVariableValueSix`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](DebugVariableValueSixBuilder::r#type)
    pub fn build(self) -> Result<DebugVariableValueSix, BuildError> {
        Ok(DebugVariableValueSix {
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
            value: self.value,
        })
    }
}
