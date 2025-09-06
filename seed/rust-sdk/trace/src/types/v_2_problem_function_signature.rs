use crate::v_2_problem_void_function_signature::VoidFunctionSignature;
use crate::v_2_problem_non_void_function_signature::NonVoidFunctionSignature;
use crate::v_2_problem_void_function_signature_that_takes_actual_result::VoidFunctionSignatureThatTakesActualResult;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum FunctionSignature {
        Void {
            #[serde(flatten)]
            data: VoidFunctionSignature,
        },

        NonVoid {
            #[serde(flatten)]
            data: NonVoidFunctionSignature,
        },

        VoidThatTakesActualResult {
            #[serde(flatten)]
            data: VoidFunctionSignatureThatTakesActualResult,
        },
}
