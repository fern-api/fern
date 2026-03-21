pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct VoidFunctionSignatureThatTakesActualResult {
    #[serde(default)]
    pub parameters: Vec<Parameter>,
    #[serde(rename = "actualResultType")]
    pub actual_result_type: VariableType,
}

impl VoidFunctionSignatureThatTakesActualResult {
    pub fn builder() -> VoidFunctionSignatureThatTakesActualResultBuilder {
        VoidFunctionSignatureThatTakesActualResultBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct VoidFunctionSignatureThatTakesActualResultBuilder {
    parameters: Option<Vec<Parameter>>,
    actual_result_type: Option<VariableType>,
}

impl VoidFunctionSignatureThatTakesActualResultBuilder {
    pub fn parameters(mut self, value: Vec<Parameter>) -> Self {
        self.parameters = Some(value);
        self
    }

    pub fn actual_result_type(mut self, value: VariableType) -> Self {
        self.actual_result_type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`VoidFunctionSignatureThatTakesActualResult`].
    /// This method will fail if any of the following fields are not set:
    /// - [`parameters`](VoidFunctionSignatureThatTakesActualResultBuilder::parameters)
    /// - [`actual_result_type`](VoidFunctionSignatureThatTakesActualResultBuilder::actual_result_type)
    pub fn build(self) -> Result<VoidFunctionSignatureThatTakesActualResult, BuildError> {
        Ok(VoidFunctionSignatureThatTakesActualResult {
            parameters: self
                .parameters
                .ok_or_else(|| BuildError::missing_field("parameters"))?,
            actual_result_type: self
                .actual_result_type
                .ok_or_else(|| BuildError::missing_field("actual_result_type"))?,
        })
    }
}
