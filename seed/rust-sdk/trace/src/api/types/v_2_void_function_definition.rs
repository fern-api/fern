pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct V2VoidFunctionDefinition {
    #[serde(default)]
    pub parameters: Vec<V2Parameter>,
    #[serde(default)]
    pub code: V2FunctionImplementationForMultipleLanguages,
}

impl V2VoidFunctionDefinition {
    pub fn builder() -> V2VoidFunctionDefinitionBuilder {
        <V2VoidFunctionDefinitionBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2VoidFunctionDefinitionBuilder {
    parameters: Option<Vec<V2Parameter>>,
    code: Option<V2FunctionImplementationForMultipleLanguages>,
}

impl V2VoidFunctionDefinitionBuilder {
    pub fn parameters(mut self, value: Vec<V2Parameter>) -> Self {
        self.parameters = Some(value);
        self
    }

    pub fn code(mut self, value: V2FunctionImplementationForMultipleLanguages) -> Self {
        self.code = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2VoidFunctionDefinition`].
    /// This method will fail if any of the following fields are not set:
    /// - [`parameters`](V2VoidFunctionDefinitionBuilder::parameters)
    /// - [`code`](V2VoidFunctionDefinitionBuilder::code)
    pub fn build(self) -> Result<V2VoidFunctionDefinition, BuildError> {
        Ok(V2VoidFunctionDefinition {
            parameters: self
                .parameters
                .ok_or_else(|| BuildError::missing_field("parameters"))?,
            code: self.code.ok_or_else(|| BuildError::missing_field("code"))?,
        })
    }
}
