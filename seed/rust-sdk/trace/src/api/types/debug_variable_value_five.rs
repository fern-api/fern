pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct DebugVariableValueFive {
    #[serde(flatten)]
    pub debug_map_value_fields: DebugMapValue,
    pub r#type: DebugVariableValueFiveType,
}

impl DebugVariableValueFive {
    pub fn builder() -> DebugVariableValueFiveBuilder {
        <DebugVariableValueFiveBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct DebugVariableValueFiveBuilder {
    debug_map_value_fields: Option<DebugMapValue>,
    r#type: Option<DebugVariableValueFiveType>,
}

impl DebugVariableValueFiveBuilder {
    pub fn debug_map_value_fields(mut self, value: DebugMapValue) -> Self {
        self.debug_map_value_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: DebugVariableValueFiveType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`DebugVariableValueFive`].
    /// This method will fail if any of the following fields are not set:
    /// - [`debug_map_value_fields`](DebugVariableValueFiveBuilder::debug_map_value_fields)
    /// - [`r#type`](DebugVariableValueFiveBuilder::r#type)
    pub fn build(self) -> Result<DebugVariableValueFive, BuildError> {
        Ok(DebugVariableValueFive {
            debug_map_value_fields: self
                .debug_map_value_fields
                .ok_or_else(|| BuildError::missing_field("debug_map_value_fields"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
