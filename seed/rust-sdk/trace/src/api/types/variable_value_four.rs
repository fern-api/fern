pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct VariableValueFour {
    pub r#type: VariableValueFourType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<String>,
}

impl VariableValueFour {
    pub fn builder() -> VariableValueFourBuilder {
        <VariableValueFourBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct VariableValueFourBuilder {
    r#type: Option<VariableValueFourType>,
    value: Option<String>,
}

impl VariableValueFourBuilder {
    pub fn r#type(mut self, value: VariableValueFourType) -> Self {
        self.r#type = Some(value);
        self
    }

    pub fn value(mut self, value: impl Into<String>) -> Self {
        self.value = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`VariableValueFour`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](VariableValueFourBuilder::r#type)
    pub fn build(self) -> Result<VariableValueFour, BuildError> {
        Ok(VariableValueFour {
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
            value: self.value,
        })
    }
}
