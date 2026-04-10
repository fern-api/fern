pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2Parameter {
    #[serde(rename = "parameterId")]
    #[serde(default)]
    pub parameter_id: V2ParameterId,
    #[serde(default)]
    pub name: String,
    #[serde(rename = "variableType")]
    pub variable_type: VariableType,
}

impl V2Parameter {
    pub fn builder() -> V2ParameterBuilder {
        <V2ParameterBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2ParameterBuilder {
    parameter_id: Option<V2ParameterId>,
    name: Option<String>,
    variable_type: Option<VariableType>,
}

impl V2ParameterBuilder {
    pub fn parameter_id(mut self, value: V2ParameterId) -> Self {
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

    /// Consumes the builder and constructs a [`V2Parameter`].
    /// This method will fail if any of the following fields are not set:
    /// - [`parameter_id`](V2ParameterBuilder::parameter_id)
    /// - [`name`](V2ParameterBuilder::name)
    /// - [`variable_type`](V2ParameterBuilder::variable_type)
    pub fn build(self) -> Result<V2Parameter, BuildError> {
        Ok(V2Parameter {
            parameter_id: self.parameter_id.ok_or_else(|| BuildError::missing_field("parameter_id"))?,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            variable_type: self.variable_type.ok_or_else(|| BuildError::missing_field("variable_type"))?,
        })
    }
}
