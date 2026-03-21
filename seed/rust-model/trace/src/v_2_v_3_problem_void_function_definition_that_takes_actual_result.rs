pub use crate::prelude::*;

/// The generated signature will include an additional param, actualResult
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct VoidFunctionDefinitionThatTakesActualResult2 {
    #[serde(rename = "additionalParameters")]
    #[serde(default)]
    pub additional_parameters: Vec<Parameter2>,
    #[serde(default)]
    pub code: FunctionImplementationForMultipleLanguages2,
}

impl VoidFunctionDefinitionThatTakesActualResult2 {
    pub fn builder() -> VoidFunctionDefinitionThatTakesActualResult2Builder {
        VoidFunctionDefinitionThatTakesActualResult2Builder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct VoidFunctionDefinitionThatTakesActualResult2Builder {
    additional_parameters: Option<Vec<Parameter2>>,
    code: Option<FunctionImplementationForMultipleLanguages2>,
}

impl VoidFunctionDefinitionThatTakesActualResult2Builder {
    pub fn additional_parameters(mut self, value: Vec<Parameter2>) -> Self {
        self.additional_parameters = Some(value);
        self
    }

    pub fn code(mut self, value: FunctionImplementationForMultipleLanguages2) -> Self {
        self.code = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`VoidFunctionDefinitionThatTakesActualResult2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`additional_parameters`](VoidFunctionDefinitionThatTakesActualResult2Builder::additional_parameters)
    /// - [`code`](VoidFunctionDefinitionThatTakesActualResult2Builder::code)
    pub fn build(self) -> Result<VoidFunctionDefinitionThatTakesActualResult2, BuildError> {
        Ok(VoidFunctionDefinitionThatTakesActualResult2 {
            additional_parameters: self.additional_parameters.ok_or_else(|| BuildError::missing_field("additional_parameters"))?,
            code: self.code.ok_or_else(|| BuildError::missing_field("code"))?,
        })
    }
}
