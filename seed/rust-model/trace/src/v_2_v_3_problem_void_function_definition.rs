pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct VoidFunctionDefinition2 {
    #[serde(default)]
    pub parameters: Vec<Parameter2>,
    #[serde(default)]
    pub code: FunctionImplementationForMultipleLanguages2,
}

impl VoidFunctionDefinition2 {
    pub fn builder() -> VoidFunctionDefinition2Builder {
        VoidFunctionDefinition2Builder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct VoidFunctionDefinition2Builder {
    parameters: Option<Vec<Parameter2>>,
    code: Option<FunctionImplementationForMultipleLanguages2>,
}

impl VoidFunctionDefinition2Builder {
    pub fn parameters(mut self, value: Vec<Parameter2>) -> Self {
        self.parameters = Some(value);
        self
    }

    pub fn code(mut self, value: FunctionImplementationForMultipleLanguages2) -> Self {
        self.code = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`VoidFunctionDefinition2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`parameters`](VoidFunctionDefinition2Builder::parameters)
    /// - [`code`](VoidFunctionDefinition2Builder::code)
    pub fn build(self) -> Result<VoidFunctionDefinition2, BuildError> {
        Ok(VoidFunctionDefinition2 {
            parameters: self.parameters.ok_or_else(|| BuildError::missing_field("parameters"))?,
            code: self.code.ok_or_else(|| BuildError::missing_field("code"))?,
        })
    }
}
