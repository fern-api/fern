use crate::v_2_problem_function_implementation_for_multiple_languages::FunctionImplementationForMultipleLanguages;
use crate::v_2_problem_non_void_function_signature::NonVoidFunctionSignature;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct NonVoidFunctionDefinition {
    pub signature: NonVoidFunctionSignature,
    pub code: FunctionImplementationForMultipleLanguages,
}
