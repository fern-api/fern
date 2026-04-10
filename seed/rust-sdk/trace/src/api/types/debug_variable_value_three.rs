pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct DebugVariableValueThree {
    pub r#type: DebugVariableValueThreeType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<String>,
}

impl DebugVariableValueThree {
    pub fn builder() -> DebugVariableValueThreeBuilder {
        <DebugVariableValueThreeBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct DebugVariableValueThreeBuilder {
    r#type: Option<DebugVariableValueThreeType>,
    value: Option<String>,
}

impl DebugVariableValueThreeBuilder {
    pub fn r#type(mut self, value: DebugVariableValueThreeType) -> Self {
        self.r#type = Some(value);
        self
    }

    pub fn value(mut self, value: impl Into<String>) -> Self {
        self.value = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`DebugVariableValueThree`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](DebugVariableValueThreeBuilder::r#type)
    pub fn build(self) -> Result<DebugVariableValueThree, BuildError> {
        Ok(DebugVariableValueThree {
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
            value: self.value,
        })
    }
}
