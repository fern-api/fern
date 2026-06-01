pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum FunctionSignature {
    #[serde(rename = "void")]
    #[non_exhaustive]
    Void {
        #[serde(default)]
        parameters: Vec<Parameter>,
    },

    #[serde(rename = "nonVoid")]
    #[non_exhaustive]
    NonVoid {
        #[serde(flatten)]
        data: NonVoidFunctionSignature,
    },

    #[serde(rename = "voidThatTakesActualResult")]
    #[non_exhaustive]
    VoidThatTakesActualResult {
        #[serde(default)]
        parameters: Vec<Parameter>,
        #[serde(rename = "actualResultType")]
        actual_result_type: VariableType,
    },

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl FunctionSignature {
    pub fn void(parameters: Vec<Parameter>) -> Self {
        Self::Void { parameters }
    }

    pub fn non_void(data: NonVoidFunctionSignature) -> Self {
        Self::NonVoid { data }
    }

    pub fn void_that_takes_actual_result(
        parameters: Vec<Parameter>,
        actual_result_type: VariableType,
    ) -> Self {
        Self::VoidThatTakesActualResult {
            parameters,
            actual_result_type,
        }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
