pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct DebugVariableValueZero {
    pub r#type: DebugVariableValueZeroType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<i64>,
}

impl DebugVariableValueZero {
    pub fn builder() -> DebugVariableValueZeroBuilder {
        <DebugVariableValueZeroBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct DebugVariableValueZeroBuilder {
    r#type: Option<DebugVariableValueZeroType>,
    value: Option<i64>,
}

impl DebugVariableValueZeroBuilder {
    pub fn r#type(mut self, value: DebugVariableValueZeroType) -> Self {
        self.r#type = Some(value);
        self
    }

    pub fn value(mut self, value: i64) -> Self {
        self.value = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`DebugVariableValueZero`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](DebugVariableValueZeroBuilder::r#type)
    pub fn build(self) -> Result<DebugVariableValueZero, BuildError> {
        Ok(DebugVariableValueZero {
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
            value: self.value,
        })
    }
}
