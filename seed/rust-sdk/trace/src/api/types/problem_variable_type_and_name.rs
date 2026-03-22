pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct VariableTypeAndName {
    #[serde(rename = "variableType")]
    pub variable_type: VariableType,
    #[serde(default)]
    pub name: String,
}

impl VariableTypeAndName {
    pub fn builder() -> VariableTypeAndNameBuilder {
        VariableTypeAndNameBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct VariableTypeAndNameBuilder {
    variable_type: Option<VariableType>,
    name: Option<String>,
}

impl VariableTypeAndNameBuilder {
    pub fn variable_type(mut self, value: VariableType) -> Self {
        self.variable_type = Some(value);
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`VariableTypeAndName`].
    /// This method will fail if any of the following fields are not set:
    /// - [`variable_type`](VariableTypeAndNameBuilder::variable_type)
    /// - [`name`](VariableTypeAndNameBuilder::name)
    pub fn build(self) -> Result<VariableTypeAndName, BuildError> {
        Ok(VariableTypeAndName {
            variable_type: self
                .variable_type
                .ok_or_else(|| BuildError::missing_field("variable_type"))?,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
        })
    }
}
