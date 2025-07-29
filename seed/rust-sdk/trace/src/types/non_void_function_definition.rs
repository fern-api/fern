use crate::non_void_function_signature::NonVoidFunctionSignature;
use crate::function_implementation_for_multiple_languages::FunctionImplementationForMultipleLanguages;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct NonVoidFunctionDefinition {
    pub signature: NonVoidFunctionSignature,
    pub code: FunctionImplementationForMultipleLanguages,
}