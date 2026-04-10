pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct DebugVariableValueTwelve {
    #[serde(flatten)]
    pub generic_value_fields: GenericValue,
    pub r#type: DebugVariableValueTwelveType,
}

impl DebugVariableValueTwelve {
    pub fn builder() -> DebugVariableValueTwelveBuilder {
        <DebugVariableValueTwelveBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct DebugVariableValueTwelveBuilder {
    generic_value_fields: Option<GenericValue>,
    r#type: Option<DebugVariableValueTwelveType>,
}

impl DebugVariableValueTwelveBuilder {
    pub fn generic_value_fields(mut self, value: GenericValue) -> Self {
        self.generic_value_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: DebugVariableValueTwelveType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`DebugVariableValueTwelve`].
    /// This method will fail if any of the following fields are not set:
    /// - [`generic_value_fields`](DebugVariableValueTwelveBuilder::generic_value_fields)
    /// - [`r#type`](DebugVariableValueTwelveBuilder::r#type)
    pub fn build(self) -> Result<DebugVariableValueTwelve, BuildError> {
        Ok(DebugVariableValueTwelve {
            generic_value_fields: self.generic_value_fields.ok_or_else(|| BuildError::missing_field("generic_value_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
