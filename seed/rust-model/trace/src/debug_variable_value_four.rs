pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct DebugVariableValueFour {
    pub r#type: DebugVariableValueFourType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<String>,
}

impl DebugVariableValueFour {
    pub fn builder() -> DebugVariableValueFourBuilder {
        <DebugVariableValueFourBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct DebugVariableValueFourBuilder {
    r#type: Option<DebugVariableValueFourType>,
    value: Option<String>,
}

impl DebugVariableValueFourBuilder {
    pub fn r#type(mut self, value: DebugVariableValueFourType) -> Self {
        self.r#type = Some(value);
        self
    }

    pub fn value(mut self, value: impl Into<String>) -> Self {
        self.value = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`DebugVariableValueFour`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](DebugVariableValueFourBuilder::r#type)
    pub fn build(self) -> Result<DebugVariableValueFour, BuildError> {
        Ok(DebugVariableValueFour {
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
            value: self.value,
        })
    }
}
