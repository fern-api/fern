pub use crate::prelude::*;

/// The generated signature will include an additional param, actualResult
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct V2VoidFunctionDefinitionThatTakesActualResult {
    #[serde(rename = "additionalParameters")]
    #[serde(default)]
    pub additional_parameters: Vec<V2Parameter>,
    #[serde(default)]
    pub code: V2FunctionImplementationForMultipleLanguages,
}

impl V2VoidFunctionDefinitionThatTakesActualResult {
    pub fn builder() -> V2VoidFunctionDefinitionThatTakesActualResultBuilder {
        <V2VoidFunctionDefinitionThatTakesActualResultBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2VoidFunctionDefinitionThatTakesActualResultBuilder {
    additional_parameters: Option<Vec<V2Parameter>>,
    code: Option<V2FunctionImplementationForMultipleLanguages>,
}

impl V2VoidFunctionDefinitionThatTakesActualResultBuilder {
    pub fn additional_parameters(mut self, value: Vec<V2Parameter>) -> Self {
        self.additional_parameters = Some(value);
        self
    }

    pub fn code(mut self, value: V2FunctionImplementationForMultipleLanguages) -> Self {
        self.code = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2VoidFunctionDefinitionThatTakesActualResult`].
    /// This method will fail if any of the following fields are not set:
    /// - [`additional_parameters`](V2VoidFunctionDefinitionThatTakesActualResultBuilder::additional_parameters)
    /// - [`code`](V2VoidFunctionDefinitionThatTakesActualResultBuilder::code)
    pub fn build(self) -> Result<V2VoidFunctionDefinitionThatTakesActualResult, BuildError> {
        Ok(V2VoidFunctionDefinitionThatTakesActualResult {
            additional_parameters: self.additional_parameters.ok_or_else(|| BuildError::missing_field("additional_parameters"))?,
            code: self.code.ok_or_else(|| BuildError::missing_field("code"))?,
        })
    }
}
