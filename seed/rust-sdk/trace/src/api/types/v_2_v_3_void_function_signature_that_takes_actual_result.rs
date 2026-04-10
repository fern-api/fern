pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2V3VoidFunctionSignatureThatTakesActualResult {
    #[serde(default)]
    pub parameters: Vec<V2V3Parameter>,
    #[serde(rename = "actualResultType")]
    pub actual_result_type: VariableType,
}

impl V2V3VoidFunctionSignatureThatTakesActualResult {
    pub fn builder() -> V2V3VoidFunctionSignatureThatTakesActualResultBuilder {
        <V2V3VoidFunctionSignatureThatTakesActualResultBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2V3VoidFunctionSignatureThatTakesActualResultBuilder {
    parameters: Option<Vec<V2V3Parameter>>,
    actual_result_type: Option<VariableType>,
}

impl V2V3VoidFunctionSignatureThatTakesActualResultBuilder {
    pub fn parameters(mut self, value: Vec<V2V3Parameter>) -> Self {
        self.parameters = Some(value);
        self
    }

    pub fn actual_result_type(mut self, value: VariableType) -> Self {
        self.actual_result_type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2V3VoidFunctionSignatureThatTakesActualResult`].
    /// This method will fail if any of the following fields are not set:
    /// - [`parameters`](V2V3VoidFunctionSignatureThatTakesActualResultBuilder::parameters)
    /// - [`actual_result_type`](V2V3VoidFunctionSignatureThatTakesActualResultBuilder::actual_result_type)
    pub fn build(self) -> Result<V2V3VoidFunctionSignatureThatTakesActualResult, BuildError> {
        Ok(V2V3VoidFunctionSignatureThatTakesActualResult {
            parameters: self
                .parameters
                .ok_or_else(|| BuildError::missing_field("parameters"))?,
            actual_result_type: self
                .actual_result_type
                .ok_or_else(|| BuildError::missing_field("actual_result_type"))?,
        })
    }
}
