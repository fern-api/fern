pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct DebugVariableValueTwo {
    pub r#type: DebugVariableValueTwoType,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)]
    #[serde(with = "crate::core::number_serializers::option")]
    pub value: Option<f64>,
}

impl DebugVariableValueTwo {
    pub fn builder() -> DebugVariableValueTwoBuilder {
        <DebugVariableValueTwoBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct DebugVariableValueTwoBuilder {
    r#type: Option<DebugVariableValueTwoType>,
    value: Option<f64>,
}

impl DebugVariableValueTwoBuilder {
    pub fn r#type(mut self, value: DebugVariableValueTwoType) -> Self {
        self.r#type = Some(value);
        self
    }

    pub fn value(mut self, value: f64) -> Self {
        self.value = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`DebugVariableValueTwo`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](DebugVariableValueTwoBuilder::r#type)
    pub fn build(self) -> Result<DebugVariableValueTwo, BuildError> {
        Ok(DebugVariableValueTwo {
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
            value: self.value,
        })
    }
}
