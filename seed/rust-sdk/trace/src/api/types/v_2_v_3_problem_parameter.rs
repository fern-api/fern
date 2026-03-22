pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Parameter2 {
    #[serde(rename = "parameterId")]
    #[serde(default)]
    pub parameter_id: ParameterId2,
    #[serde(default)]
    pub name: String,
    #[serde(rename = "variableType")]
    pub variable_type: VariableType,
}

impl Parameter2 {
    pub fn builder() -> Parameter2Builder {
        Parameter2Builder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct Parameter2Builder {
    parameter_id: Option<ParameterId2>,
    name: Option<String>,
    variable_type: Option<VariableType>,
}

impl Parameter2Builder {
    pub fn parameter_id(mut self, value: ParameterId2) -> Self {
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

    /// Consumes the builder and constructs a [`Parameter2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`parameter_id`](Parameter2Builder::parameter_id)
    /// - [`name`](Parameter2Builder::name)
    /// - [`variable_type`](Parameter2Builder::variable_type)
    pub fn build(self) -> Result<Parameter2, BuildError> {
        Ok(Parameter2 {
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
