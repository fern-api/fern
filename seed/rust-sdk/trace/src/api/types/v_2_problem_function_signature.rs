pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
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
}

impl FunctionSignature {
    pub fn void(parameters: Vec<Parameter>) -> Self {
        Self::Void { parameters }
    }

    pub fn non_void(data: NonVoidFunctionSignature) -> Self {
        Self::NonVoid { data }
    }

    pub fn void_that_takes_actual_result(parameters: Vec<Parameter>, actual_result_type: VariableType) -> Self {
        Self::VoidThatTakesActualResult { parameters, actual_result_type }
    }
}
