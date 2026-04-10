pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct DebugVariableValueTen {
    pub r#type: DebugVariableValueTenType,
}

impl DebugVariableValueTen {
    pub fn builder() -> DebugVariableValueTenBuilder {
        <DebugVariableValueTenBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct DebugVariableValueTenBuilder {
    r#type: Option<DebugVariableValueTenType>,
}

impl DebugVariableValueTenBuilder {
    pub fn r#type(mut self, value: DebugVariableValueTenType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`DebugVariableValueTen`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](DebugVariableValueTenBuilder::r#type)
    pub fn build(self) -> Result<DebugVariableValueTen, BuildError> {
        Ok(DebugVariableValueTen {
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
