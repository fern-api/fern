pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct V2V3VoidFunctionDefinition {
    #[serde(default)]
    pub parameters: Vec<V2V3Parameter>,
    #[serde(default)]
    pub code: V2V3FunctionImplementationForMultipleLanguages,
}

impl V2V3VoidFunctionDefinition {
    pub fn builder() -> V2V3VoidFunctionDefinitionBuilder {
        <V2V3VoidFunctionDefinitionBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2V3VoidFunctionDefinitionBuilder {
    parameters: Option<Vec<V2V3Parameter>>,
    code: Option<V2V3FunctionImplementationForMultipleLanguages>,
}

impl V2V3VoidFunctionDefinitionBuilder {
    pub fn parameters(mut self, value: Vec<V2V3Parameter>) -> Self {
        self.parameters = Some(value);
        self
    }

    pub fn code(mut self, value: V2V3FunctionImplementationForMultipleLanguages) -> Self {
        self.code = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2V3VoidFunctionDefinition`].
    /// This method will fail if any of the following fields are not set:
    /// - [`parameters`](V2V3VoidFunctionDefinitionBuilder::parameters)
    /// - [`code`](V2V3VoidFunctionDefinitionBuilder::code)
    pub fn build(self) -> Result<V2V3VoidFunctionDefinition, BuildError> {
        Ok(V2V3VoidFunctionDefinition {
            parameters: self
                .parameters
                .ok_or_else(|| BuildError::missing_field("parameters"))?,
            code: self.code.ok_or_else(|| BuildError::missing_field("code"))?,
        })
    }
}
