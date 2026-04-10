pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct VariableValueTwo {
    pub r#type: VariableValueTwoType,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)]
    #[serde(with = "crate::core::number_serializers::option")]
    pub value: Option<f64>,
}

impl VariableValueTwo {
    pub fn builder() -> VariableValueTwoBuilder {
        <VariableValueTwoBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct VariableValueTwoBuilder {
    r#type: Option<VariableValueTwoType>,
    value: Option<f64>,
}

impl VariableValueTwoBuilder {
    pub fn r#type(mut self, value: VariableValueTwoType) -> Self {
        self.r#type = Some(value);
        self
    }

    pub fn value(mut self, value: f64) -> Self {
        self.value = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`VariableValueTwo`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](VariableValueTwoBuilder::r#type)
    pub fn build(self) -> Result<VariableValueTwo, BuildError> {
        Ok(VariableValueTwo {
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
            value: self.value,
        })
    }
}
