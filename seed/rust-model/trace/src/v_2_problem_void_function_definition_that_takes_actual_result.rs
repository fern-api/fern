pub use crate::prelude::*;

/// The generated signature will include an additional param, actualResult
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct VoidFunctionDefinitionThatTakesActualResult {
    #[serde(rename = "additionalParameters")]
    #[serde(default)]
    pub additional_parameters: Vec<Parameter>,
    #[serde(default)]
    pub code: FunctionImplementationForMultipleLanguages,
}

impl VoidFunctionDefinitionThatTakesActualResult {
    pub fn builder() -> VoidFunctionDefinitionThatTakesActualResultBuilder {
        VoidFunctionDefinitionThatTakesActualResultBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct VoidFunctionDefinitionThatTakesActualResultBuilder {
    additional_parameters: Option<Vec<Parameter>>,
    code: Option<FunctionImplementationForMultipleLanguages>,
}

impl VoidFunctionDefinitionThatTakesActualResultBuilder {
    pub fn additional_parameters(mut self, value: Vec<Parameter>) -> Self {
        self.additional_parameters = Some(value);
        self
    }

    pub fn code(mut self, value: FunctionImplementationForMultipleLanguages) -> Self {
        self.code = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`VoidFunctionDefinitionThatTakesActualResult`].
    /// This method will fail if any of the following fields are not set:
    /// - [`additional_parameters`](VoidFunctionDefinitionThatTakesActualResultBuilder::additional_parameters)
    /// - [`code`](VoidFunctionDefinitionThatTakesActualResultBuilder::code)
    pub fn build(self) -> Result<VoidFunctionDefinitionThatTakesActualResult, BuildError> {
        Ok(VoidFunctionDefinitionThatTakesActualResult {
            additional_parameters: self.additional_parameters.ok_or_else(|| BuildError::missing_field("additional_parameters"))?,
            code: self.code.ok_or_else(|| BuildError::missing_field("code"))?,
        })
    }
}
