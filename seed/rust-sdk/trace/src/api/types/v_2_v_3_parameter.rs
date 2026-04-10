pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2V3Parameter {
    #[serde(rename = "parameterId")]
    #[serde(default)]
    pub parameter_id: V2V3ParameterId,
    #[serde(default)]
    pub name: String,
    #[serde(rename = "variableType")]
    pub variable_type: VariableType,
}

impl V2V3Parameter {
    pub fn builder() -> V2V3ParameterBuilder {
        <V2V3ParameterBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2V3ParameterBuilder {
    parameter_id: Option<V2V3ParameterId>,
    name: Option<String>,
    variable_type: Option<VariableType>,
}

impl V2V3ParameterBuilder {
    pub fn parameter_id(mut self, value: V2V3ParameterId) -> Self {
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

    /// Consumes the builder and constructs a [`V2V3Parameter`].
    /// This method will fail if any of the following fields are not set:
    /// - [`parameter_id`](V2V3ParameterBuilder::parameter_id)
    /// - [`name`](V2V3ParameterBuilder::name)
    /// - [`variable_type`](V2V3ParameterBuilder::variable_type)
    pub fn build(self) -> Result<V2V3Parameter, BuildError> {
        Ok(V2V3Parameter {
            parameter_id: self
                .parameter_id
                .ok_or_else(|| BuildError::missing_field("parameter_id"))?,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            variable_type: self
                .variable_type
                .ok_or_else(|| BuildError::missing_field("variable_type"))?,
        })
    }
}
