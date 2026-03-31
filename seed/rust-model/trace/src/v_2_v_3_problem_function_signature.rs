pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum FunctionSignature2 {
        #[serde(rename = "void")]
        #[non_exhaustive]
        Void {
            #[serde(default)]
            parameters: Vec<Parameter2>,
        },

        #[serde(rename = "nonVoid")]
        #[non_exhaustive]
        NonVoid {
            #[serde(flatten)]
            data: NonVoidFunctionSignature2,
        },

        #[serde(rename = "voidThatTakesActualResult")]
        #[non_exhaustive]
        VoidThatTakesActualResult {
            #[serde(default)]
            parameters: Vec<Parameter2>,
            #[serde(rename = "actualResultType")]
            actual_result_type: VariableType,
        },
}

impl FunctionSignature2 {
    pub fn void(parameters: Vec<Parameter2>) -> Self {
        Self::Void { parameters }
    }

    pub fn non_void(data: NonVoidFunctionSignature2) -> Self {
        Self::NonVoid { data }
    }

    pub fn void_that_takes_actual_result(parameters: Vec<Parameter2>, actual_result_type: VariableType) -> Self {
        Self::VoidThatTakesActualResult { parameters, actual_result_type }
    }
}
