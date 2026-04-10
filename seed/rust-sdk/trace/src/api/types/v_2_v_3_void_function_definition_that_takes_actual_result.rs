pub use crate::prelude::*;

/// The generated signature will include an additional param, actualResult
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct V2V3VoidFunctionDefinitionThatTakesActualResult {
    #[serde(rename = "additionalParameters")]
    #[serde(default)]
    pub additional_parameters: Vec<V2V3Parameter>,
    #[serde(default)]
    pub code: V2V3FunctionImplementationForMultipleLanguages,
}

impl V2V3VoidFunctionDefinitionThatTakesActualResult {
    pub fn builder() -> V2V3VoidFunctionDefinitionThatTakesActualResultBuilder {
        <V2V3VoidFunctionDefinitionThatTakesActualResultBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2V3VoidFunctionDefinitionThatTakesActualResultBuilder {
    additional_parameters: Option<Vec<V2V3Parameter>>,
    code: Option<V2V3FunctionImplementationForMultipleLanguages>,
}

impl V2V3VoidFunctionDefinitionThatTakesActualResultBuilder {
    pub fn additional_parameters(mut self, value: Vec<V2V3Parameter>) -> Self {
        self.additional_parameters = Some(value);
        self
    }

    pub fn code(mut self, value: V2V3FunctionImplementationForMultipleLanguages) -> Self {
        self.code = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2V3VoidFunctionDefinitionThatTakesActualResult`].
    /// This method will fail if any of the following fields are not set:
    /// - [`additional_parameters`](V2V3VoidFunctionDefinitionThatTakesActualResultBuilder::additional_parameters)
    /// - [`code`](V2V3VoidFunctionDefinitionThatTakesActualResultBuilder::code)
    pub fn build(self) -> Result<V2V3VoidFunctionDefinitionThatTakesActualResult, BuildError> {
        Ok(V2V3VoidFunctionDefinitionThatTakesActualResult {
            additional_parameters: self
                .additional_parameters
                .ok_or_else(|| BuildError::missing_field("additional_parameters"))?,
            code: self.code.ok_or_else(|| BuildError::missing_field("code"))?,
        })
    }
}
