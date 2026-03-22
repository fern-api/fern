pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Parameter {
    #[serde(rename = "parameterId")]
    #[serde(default)]
    pub parameter_id: ParameterId,
    #[serde(default)]
    pub name: String,
    #[serde(rename = "variableType")]
    pub variable_type: VariableType,
}

impl Parameter {
    pub fn builder() -> ParameterBuilder {
        ParameterBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ParameterBuilder {
    parameter_id: Option<ParameterId>,
    name: Option<String>,
    variable_type: Option<VariableType>,
}

impl ParameterBuilder {
    pub fn parameter_id(mut self, value: ParameterId) -> Self {
        self.parameter_id = Some(value);
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn variable_type(mut self, value: VariableType) -> Self {
        self.variable_type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Parameter`].
    /// This method will fail if any of the following fields are not set:
    /// - [`parameter_id`](ParameterBuilder::parameter_id)
    /// - [`name`](ParameterBuilder::name)
    /// - [`variable_type`](ParameterBuilder::variable_type)
    pub fn build(self) -> Result<Parameter, BuildError> {
        Ok(Parameter {
            parameter_id: self.parameter_id.ok_or_else(|| BuildError::missing_field("parameter_id"))?,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            variable_type: self.variable_type.ok_or_else(|| BuildError::missing_field("variable_type"))?,
        })
    }
}
