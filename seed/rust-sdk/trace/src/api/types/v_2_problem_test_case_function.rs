pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum TestCaseFunction {
    #[serde(rename = "withActualResult")]
    #[non_exhaustive]
    WithActualResult {
        #[serde(rename = "getActualResult")]
        get_actual_result: NonVoidFunctionDefinition,
        #[serde(rename = "assertCorrectnessCheck")]
        assert_correctness_check: AssertCorrectnessCheck,
    },

    #[serde(rename = "custom")]
    #[non_exhaustive]
    Custom {
        #[serde(default)]
        parameters: Vec<Parameter>,
        #[serde(default)]
        code: FunctionImplementationForMultipleLanguages,
    },
}

impl TestCaseFunction {
    pub fn with_actual_result(
        get_actual_result: NonVoidFunctionDefinition,
        assert_correctness_check: AssertCorrectnessCheck,
    ) -> Self {
        Self::WithActualResult {
            get_actual_result,
            assert_correctness_check,
        }
    }

    pub fn custom(
        parameters: Vec<Parameter>,
        code: FunctionImplementationForMultipleLanguages,
    ) -> Self {
        Self::Custom { parameters, code }
    }
}
