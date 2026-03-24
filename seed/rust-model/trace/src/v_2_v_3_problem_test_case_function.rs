pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum TestCaseFunction2 {
        #[serde(rename = "withActualResult")]
        #[non_exhaustive]
        WithActualResult {
            #[serde(rename = "getActualResult")]
            get_actual_result: NonVoidFunctionDefinition2,
            #[serde(rename = "assertCorrectnessCheck")]
            assert_correctness_check: AssertCorrectnessCheck2,
        },

        #[serde(rename = "custom")]
        #[non_exhaustive]
        Custom {
            #[serde(default)]
            parameters: Vec<Parameter2>,
            #[serde(default)]
            code: FunctionImplementationForMultipleLanguages2,
        },
}

impl TestCaseFunction2 {
    pub fn with_actual_result(get_actual_result: NonVoidFunctionDefinition2, assert_correctness_check: AssertCorrectnessCheck2) -> Self {
        Self::WithActualResult { get_actual_result, assert_correctness_check }
    }

    pub fn custom(parameters: Vec<Parameter2>, code: FunctionImplementationForMultipleLanguages2) -> Self {
        Self::Custom { parameters, code }
    }
}
