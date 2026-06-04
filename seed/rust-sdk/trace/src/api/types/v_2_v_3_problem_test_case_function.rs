pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
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

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl TestCaseFunction2 {
    pub fn with_actual_result(
        get_actual_result: NonVoidFunctionDefinition2,
        assert_correctness_check: AssertCorrectnessCheck2,
    ) -> Self {
        Self::WithActualResult {
            get_actual_result,
            assert_correctness_check,
        }
    }

    pub fn custom(
        parameters: Vec<Parameter2>,
        code: FunctionImplementationForMultipleLanguages2,
    ) -> Self {
        Self::Custom { parameters, code }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
