pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
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

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
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

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
