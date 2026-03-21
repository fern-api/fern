pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct VoidFunctionDefinition {
    #[serde(default)]
    pub parameters: Vec<Parameter>,
    #[serde(default)]
    pub code: FunctionImplementationForMultipleLanguages,
}

impl VoidFunctionDefinition {
    pub fn builder() -> VoidFunctionDefinitionBuilder {
        VoidFunctionDefinitionBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct VoidFunctionDefinitionBuilder {
    parameters: Option<Vec<Parameter>>,
    code: Option<FunctionImplementationForMultipleLanguages>,
}

impl VoidFunctionDefinitionBuilder {
    pub fn parameters(mut self, value: Vec<Parameter>) -> Self {
        self.parameters = Some(value);
        self
    }

    pub fn code(mut self, value: FunctionImplementationForMultipleLanguages) -> Self {
        self.code = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`VoidFunctionDefinition`].
    /// This method will fail if any of the following fields are not set:
    /// - [`parameters`](VoidFunctionDefinitionBuilder::parameters)
    /// - [`code`](VoidFunctionDefinitionBuilder::code)
    pub fn build(self) -> Result<VoidFunctionDefinition, BuildError> {
        Ok(VoidFunctionDefinition {
            parameters: self.parameters.ok_or_else(|| BuildError::missing_field("parameters"))?,
            code: self.code.ok_or_else(|| BuildError::missing_field("code"))?,
        })
    }
}
