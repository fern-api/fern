use crate::v_2_problem_non_void_function_signature::NonVoidFunctionSignature;
use crate::v_2_problem_function_implementation_for_multiple_languages::FunctionImplementationForMultipleLanguages;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NonVoidFunctionDefinition {
    pub signature: NonVoidFunctionSignature,
    pub code: FunctionImplementationForMultipleLanguages,
}