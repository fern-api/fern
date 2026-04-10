pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct DebugVariableValueOne {
    pub r#type: DebugVariableValueOneType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<bool>,
}

impl DebugVariableValueOne {
    pub fn builder() -> DebugVariableValueOneBuilder {
        <DebugVariableValueOneBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct DebugVariableValueOneBuilder {
    r#type: Option<DebugVariableValueOneType>,
    value: Option<bool>,
}

impl DebugVariableValueOneBuilder {
    pub fn r#type(mut self, value: DebugVariableValueOneType) -> Self {
        self.r#type = Some(value);
        self
    }

    pub fn value(mut self, value: bool) -> Self {
        self.value = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`DebugVariableValueOne`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](DebugVariableValueOneBuilder::r#type)
    pub fn build(self) -> Result<DebugVariableValueOne, BuildError> {
        Ok(DebugVariableValueOne {
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
            value: self.value,
        })
    }
}
