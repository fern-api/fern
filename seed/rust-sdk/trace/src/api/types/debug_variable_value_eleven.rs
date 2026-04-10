pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct DebugVariableValueEleven {
    pub r#type: DebugVariableValueElevenType,
}

impl DebugVariableValueEleven {
    pub fn builder() -> DebugVariableValueElevenBuilder {
        <DebugVariableValueElevenBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct DebugVariableValueElevenBuilder {
    r#type: Option<DebugVariableValueElevenType>,
}

impl DebugVariableValueElevenBuilder {
    pub fn r#type(mut self, value: DebugVariableValueElevenType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`DebugVariableValueEleven`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](DebugVariableValueElevenBuilder::r#type)
    pub fn build(self) -> Result<DebugVariableValueEleven, BuildError> {
        Ok(DebugVariableValueEleven {
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
